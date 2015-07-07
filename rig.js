/*
  HamLibJS
  rigctl Controller Process
*/



  /** Dependencies **/
  var Promise = require('promise');

  /** Init **/
        // Parse Config
        var config = process.argv[2];
            args = {
              "-m" : "1"
            }

        // Connect to rigctl
          var child = require('child_process').spawn('rigctl', args);
          var onDataFunction = null;

          // Stdout Listener
          var buf = "";
          child.stdout.on('data', function(data){
            if((data+"").indexOf("Rig command:") > 0){
              buf = buf + data;
              onDataFunction('success', buf);
              buf = "";
            }
            else {
              buf = buf + data;
            }
          });

          // Stderr Listener
          child.stderr.on('data', function(data){
            onDataFunction('failure', data);
          });

          // Close Listener
          child.on('close', function(){
            if (code !== 0){
              process.send({'error' : 'rigctl process exited unexpectedly.', "code" : err});
            }
          });

        // rigctl Command Function
          var rigctl={};
          rigctl.command = function(command){
              return new Promise(function(success, failure){
                  onDataFunction = function(status, data){

                    if(status == 'success'){
                      data = (data+"").replace(/^.*Rig command:.*$/mg, "").replace(/^\s*[\r\n]/gm, "").replace(/\n$/, "").toLowerCase();
                      data = data.split('\n');

                      var resobj = {};
                      for (var i = 0; i < data.length; i++){
                        if (data[i].indexOf(":") > 0){
                           var ln = data[i].split(':');
                           resobj[ln[0].trim()] = ln[1].trim();
                        }
                      }

                      success(resobj);
                    }
                    else if (status == 'failure'){
                      failure(data);
                    }
                  }

                  child.stdin.write(command+"\n");
              });
          }

  /** Functions **/
        // VFO
            rigctl.set_frequency = function(opts){ return rigctl.command('F '+opts.frequency)}
            rigctl.get_frequency = function(){return rigctl.command ('f')}
            rigctl.set_mode = function(opts){ return rigctl.command ('M '+opts.mode)}
            rigctl.get_mode = function(){ return rigctl.command ('m')}
            rigctl.set_vfo = function(opts){ return rigctl.command ('V '+opts.vfo)}
            rigctl.get_vfo = function(){ return rigctl.command ('v')}

            rigctl.set_rit = function(opts){ return rigctl.command ('J '+opts.rit)}
            rigctl.get_rit = function(){ return rigctl.command ('j')}
            rigctl.set_xit = function(opts){ return rigctl.command ('Z '+opts.xit)}
            rigctl.get_xit = function(){ return rigctl.command ('z')}

            rigctl.set_split_vfo = function(opts){ return rigctl.command ('S '+opts.enabled+' '+opts.txvfo)}
            rigctl.get_split_vfo = function(){ return rigctl.command ('s')}
            rigctl.set_split_freq = function(opts){ return rigctl.command ('I '+opts.freq)}
            rigctl.get_split_freq = function(){ return rigctl.command ('i')}

        // TX
            rigctl.set_ptt = function(opts){ return rigctl.command ('T '+opts.ptt)}
            rigctl.get_ptt = function(){ return rigctl.command ('t')}
            rigctl.toggle_ptt = function(){
              return rigctl.get_ptt.then(function(status){
                return rigctl.set_ptt((status.PTT == 0 ? 1 : 0));
              });
            }

        // FUNCTIONS
            rigctl.functions = ["FAGC", "NB", "COMP", "VOX", "TONE", "TSQL", "SBKIN", "FBKIN", "ANF", "NR", "AIP", "APF", "MON", "MN", "RF", "ARO", "LOCK", "MUTE", "VSC", "REV", "SQL", "ABM", "BC", "MBC", "AFC", "SATMODE", "SCOPE", "RESUME", "TBURST", "TUNER"]
            rigctl.set_func = function(opts){ return rigctl.command ('U '+opts.func + ' '+opts.val)}
            rigctl.get_func = function(opts){ return rigctl.command ('u '+opts.func)}

        // LEVELS
            rigctl.levels = ["PREAMP", "ATT", "VOX", "AF", "RF", "SQL", "IF", "APF", "NR", "PBT_IN", "PBT_OUT", "CWPITCH", "RFPOWER", "MICGAIN", "KEYSPD", "NOTCHF", "COMP", "AGC", "BKINDL", "BAL", "METER", "VOXGAIN", "ANTIVOX", "SLOPE_LOW", "SLOPE_HIGH", "RAWSTR", "SQLSTAT", "SWR", "ALC", "STRENGTH"]
            rigctl.set_level = function(opts){ return rigctl.command ('L '+opts.level + ' '+opts.val)}
            rigctl.get_level = function(opts){ return rigctl.command ('l '+opts.level)}

  /** Listen for Commands **/
      process.on('message', function(m){
        if(typeof(m) !== 'undefined' && m.hasOwnProperty('cmd')){
          rigctl[m.cmd](m).done(function(res){
            res.cmd = m.cmd;
            process.send(res);
          },
          function(err){
            process.send('{cmd:"'+m.cmd+'",err:"'+err+'"}');
          });
        }
      });

  /** Poll for Changes **/
      var cache = {};

      var poll_function = function(flag, method){
        return new Promise(function(fufill, reject){
            method().done(function(res){
              if (!cache.hasOwnProperty(flag) || cache[flag] != JSON.stringify(res)){
                cache[flag] = JSON.stringify(res);
                res.event = flag;
                process.send(res);
                fufill();
              }
            },
            function(err){
              process.send({'error' : flag, "code" : err});
              reject();
            });
        });
      }

      /* Rapid Polling for VFO, Frequency, Mode, ETC */
      var rapid_poll = function(delay){
        poll_function("frequencyChange", rigctl.get_frequency).then(function(){
          return poll_function("modeChange", rigctl.get_mode);
        }).then(function(){
          return poll_function("vfoChange", rigctl.get_vfo);
        }).then(function(){
          return poll_function("ritChange", rigctl.get_rit);
        }).then(function(){
          return poll_function("xitChange", rigctl.get_xit);
        }).then(function(){
          return poll_function("pttChange", rigctl.get_ptt);
        }).then(function(){
          setInterval(rapid_poll,delay);
        });
      }
      rapid_poll(1000);

      /* Delated Polling for other Settings **/
      var rapid_poll = function(){

      }
      setInterval(rapid_poll, 5000);
