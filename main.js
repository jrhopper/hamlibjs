/*
  HamLibJS
  A Simple Inteface for HamLib's rigctl interface
*/

  /* Init */
    var Promise = require('promise');
    var Child = require('child_process');
    var EventEmitter = require('events').EventEmitter;

  /* HamLib Interface */
    var hamlib = {};

  /** Rig Object **/
    hamlib.rig = function(opts){
      var rig = new EventEmitter();
          rig.conn = {};

      /* Setup Connection Method */
          rig.remote = (typeof(opts) !== 'undefined' && opts.hasOwnProperty('remote') && opts.remote);

          // Remote Method
          if(rig.remote){

          }

          // Local Method
          else{
            rig.conn.process = Child.fork('./rig.js', [JSON.stringify(opts)]);
            rig.conn.sendCommand = function(message){
              rig.conn.process.send(message);
              return new Promise(function(fufill, reject){
                var listener = function(m){
                  if (typeof(m) !== 'undefined' && m.hasOwnProperty('cmd') && m.cmd == message.cmd){
                    rig.conn.process.removeListener('message', listener);
                    if(m.hasOwnProperty('err')){
                      reject(m);
                    }
                    else{
                      fufill(m);
                    }
                  }
                };
                rig.conn.process.on('message', listener);
              });
            }
          }

      /** Rig Methods **/
          // VFO
            rig.get_frequency = function(){return rig.conn.sendCommand({"cmd" : "get_frequency"})}
            rig.set_frequency = function(frequency){return rig.conn.sendCommand({"cmd" : "set_frequency", "frequency": frequency})}
            rig.get_mode = function(){return rig.conn.sendCommand({"cmd" : "get_mode"})}
            rig.set_mode = function(mode){return rig.conn.sendCommand({"cmd" : "set_mode", "mode": mode})}
            rig.get_vfo = function(){return rig.conn.sendCommand({"cmd" : "get_vfo"})}
            rig.set_vfo = function(vfo){return rig.conn.sendCommand({"cmd" : "set_vfo", "vfo": vfo})}

            rig.get_rit = function(){return rig.conn.sendCommand({"cmd" : "get_rit"})}
            rig.set_rit = function(rit){return rig.conn.sendCommand({"cmd" : "set_rit", "rit": rit})}
            rig.get_xit = function(){return rig.conn.sendCommand({"cmd" : "get_xit"})}
            rig.set_xit = function(xit){return rig.conn.sendCommand({"cmd" : "set_xit", "xit": xit})}

            rig.get_split_vfo = function(){return rig.conn.sendCommand({"cmd" : "get_split_vfo"})}
            rig.set_split_vfo = function(enabled, txvfo){return rig.conn.sendCommand({"cmd" : "set_split_vfo", "enabled": enabled, "txfvo": txvfo})}
            rig.get_split_freq = function(){return rig.conn.sendCommand({"cmd" : "get_split_freq"})}
            rig.set_split_freq = function(xit){return rig.conn.sendCommand({"cmd" : "set_split_freq", "freq": freq})}

            rig.get_ptt = function(){return rig.conn.sendCommand({"cmd" : "get_ptt"})}
            rig.set_ptt = function(xit){return rig.conn.sendCommand({"cmd" : "set_ptt", "ptt": ptt})}
            rig.toggle_ptt = function(){return rig.conn.sendCommand({"cmd" : "toggle_ptt"})}

            rig.get_func = function(func){return rig.conn.sendCommand({"cmd" : "get_func", "func" : func})}
            rig.set_func = function(func, val){return rig.conn.sendCommand({"cmd" : "set_func", "func": func, "val" : val})}

            rig.get_level = function(level){return rig.conn.sendCommand({"cmd" : "get_level", "level" : level})}
            rig.set_level = function(level, val){return rig.conn.sendCommand({"cmd" : "set_level", "level": level, "val" : val})}

      return rig;
    }

  /* Rotator Object */
    hamlib.rot = function(opts){
      var rot = new EventEmitter();
      rot.conn = {};
      rot.remote = (typeof(opts) !== 'undefined' && opts.hasOwnProperty('remote') && opts.remote);
    }

  /* Server */
    hamlib.server = function(){

    }

    var rigtest = new hamlib.rig({});
    rigtest.get_frequency().done(function(m){
      console.log(m);
    }, function(err){
      console.log(err);
    });
