/**
  HamLibJS
  Simple Interface for accessing the HamLib CLI
**/

  /* INIT */
    var Promise = require('promise');
    var exec = require('child_process').exec;
    var spawn = require('child_process').spawn;

    var hamlib = {};

    var cmd = "rigctl";

  /** Accessor for Utility Functions **/
      hamlib.util = {};

      /* Get HamLib Version */
      hamlib.util.version = new Promise(function(fufill, reject){
        exec(cmd + ' -V', function(error, stdout, stderr){
          if (error){
            reject(stderr)
          }
          else{
            fufill(stdout)
          }
        });
      });


  /** Create a Radio Connection **/
  hamlib.rig = function(opts){
      var rig = {};

      /** Build Args **/
        args = {
          "-m" : "1"
        }

      /** Open Shell **/
          var ishell = require('child_process').spawn;
          var child = spawn('rigctl', args);

          res = function(){
              child.stdout.write("");
              return new Promise(function(fufill, reject){
              child.stdout.on('data', function(data){
                fufill(data);
              });
              child.stderr.on('data', function(data){
                reject(code);
              });
              child.on('close', function(code){
                if (code !== 0){
                  console.log('Process exited with code '+code);
                  reject(code);
                }
              })
          })};

      /** Abstract Functions **/
        rig.command = function(command){return new Promise(function(fufill, reject){
            child.stdin.write(command+"\n");
            res().done(function(data){
               data = (data+"").replace(/^.*Rig command:.*$/mg, "").replace(/^\s*[\r\n]/gm, "").replace(/\n$/, "");
               data = data.split('\n');

               var resobj = {};
               for (var i = 0; i < data.length; i++){
                 if (data[i].indexOf(":") > 0){
                    var ln = data[i].split(':');
                    resobj[ln[0].trim()] = ln[1].trim();
                 }
               }

              fufill(resobj);
            },
            function(err){
              reject(err);
            });
        })}

      /** Radio Functions **/
          // VFO
          rig.set_frequency = function(freq){ return rig.command('F '+freq)}
          rig.get_frequency = function(){ return rig.command ('f')}
          rig.set_mode = function(mode){ return rig.command ('M '+mode)}
          rig.get_mode = function(){ return rig.command ('m')}
          rig.set_vfo = function(vfo){ return rig.command ('V '+vfo)}
          rig.get_vfo = function(){ return rig.command ('v')}

          rig.set_rit = function(rit){ return rig.command ('J '+rit)}
          rig.get_rit = function(){ return rig.command ('j')}
          rig.set_xit = function(xit){ return rig.command ('Z '+xit)}
          rig.get_xit = function(){ return rig.command ('z')}

          rig.set_split_vfo = function(enabled, txvfo){ return rig.command ('S '+enabled+' '+txvfo)}
          rig.get_split_vfo = function(){ return rig.command ('s')}
          rig.set_split_freq = function(freq){ return rig.command ('I '+freq)}
          rig.get_split_freq = function(){ return rig.command ('i')}

          // TX
          rig.set_ptt = function(ptt){ return rig.command ('T '+ptt)}
          rig.get_ptt = function(){ return rig.command ('t')}
          rig.toggle_ptt = function(){
            return rig.get_ptt.then(function(status){
                return rig.set_ptt((status.PTT == 0 ? 1 : 0));
            });
          }

          // FUNCTIONS
          rig.set_func = function(func, val){ return rig.command ('U '+func + ' '+val)}
          rig.get_func = function(func){ return rig.command ('u '+func)}

          // LEVELS
          rig.set_level = function(level, val){ return rig.command ('L '+level + ' '+val)}
          rig.get_level = function(level){ return rig.command ('l '+level)}

      return rig;
  };

  module.exports = hamlib;
