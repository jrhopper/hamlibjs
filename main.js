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
            // Create Command Process

            // Create Event Listener

          }

          // Local Method
          else{
            // Create Command Process
                var cmdnr = 1;
                rig.conn.process = Child.fork('./rig.js', [JSON.stringify(opts)]);
                rig.conn.sendCommand = function(message){
                  message.cmdnr = cmdnr;
                  cmdnr++;
                  rig.conn.process.send(message);
                  return new Promise(function(fufill, reject){
                    var cmdlistener = function(m){
                      if (typeof(m) !== 'undefined' && m.hasOwnProperty('cmdnr') && m.cmdnr == message.cmdnr){
                        rig.conn.process.removeListener('message', cmdlistener);
                        if(m.hasOwnProperty('err')){
                          reject(m);
                        }
                        else{
                          fufill(m);
                        }
                      }
                    };
                    rig.conn.process.on('message', cmdlistener);
                  });
                }

            // Create Event Listener
              var evtlistener = function(m){
                if (typeof(m) !== 'undefined' && m.hasOwnProperty('event')){
                  rig.emit(m.event, m);
                }
                else if (typeof(m) !== 'undefined' && m.hasOwnProperty('error')){
                  rig.emit('error', m);
                }
              }
              rig.conn.process.on('message', evtlistener);
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

        // TX
            rig.get_ptt = function(){return rig.conn.sendCommand({"cmd" : "get_ptt"})}
            rig.set_ptt = function(xit){return rig.conn.sendCommand({"cmd" : "set_ptt", "ptt": ptt})}
            rig.toggle_ptt = function(){return rig.conn.sendCommand({"cmd" : "toggle_ptt"})}

        // FUNCTIONS
            rig.get_func = function(func){return rig.conn.sendCommand({"cmd" : "get_func", "func" : func})}
            rig.set_func = function(func, val){return rig.conn.sendCommand({"cmd" : "set_func", "func": func, "val" : val})}

        // LEVEL
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
