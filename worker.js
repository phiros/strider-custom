'use strict';

var ejs = require('ejs');

module.exports = {
  init: function (config, job, context, done) {
    var config = config || {};
    
    done(null, {
      environment: shellCommand(config.environment, config.shell, job),
      prepare: shellCommand(config.prepare, config.shell, job),
      test: shellCommand(config.test, config.shell, job),
      deploy: shellCommand(config.deploy, config.shell, job),
      cleanup: shellCommand(config.cleanup, config.shell, job)
    });
  }
};

function shellCommand(command, shell, job) {
  if (!command) {
    return;
  }
  
  var normalizedCommand = command.replace(/#[^\n]*/g, '').trim();
  
  if (!normalizedCommand.length) {
    return;
  }

  var commandToExecute = compileScript(job, normalizedCommand);
  
  if ((/bash/i).test(shell)) {  
    return {
      command: 'bash',
      args: ['-e', '-x', '-c', commandToExecute]
    };
  }
  else if ((/powershell/i).test(shell)) {
    return {
      command: 'powershell',
      args: ['-NonInteractive', '-Command', commandToExecute]
    }
  }
  else if (process.platform === 'win32') {
    return {
      command: 'cmd',
      args: ['/c', commandToExecute]
    }
  }
  
  return {
    command: 'sh',
    args: ['-e', '-x', '-c', commandToExecute]
  };
}

var compileScript = function(job, shellScript) {
  var compiled = ejs.compile(shellScript,'utf-8');
  var compiledScript = compiled(job);

  return compiledScript;
};
