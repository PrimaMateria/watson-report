
var express = require('express');
var router = express.Router();

var SEPARATOR = '.';

/* GET home page. */
router.get('/', function(req, res, next) {
  get_sankey_data(function(sankey_data) {
    res.json(sankey_data);
  });
});

function get_sankey_data(end) {
  var report = get_watson_data(
    function() {
      var sankey_data = [];
      var watson_data = JSON.parse(report.stdout);
      watson_data.projects.forEach(function(project) {

        sankey_data.push({source: 'capacity', target: project.name, value: project.time});
        project.tags.forEach(function(tag) {
          var source;
          if (tag.name.indexOf(SEPARATOR) !== -1) {
            source = tag.name.substring(0, tag.name.lastIndexOf(SEPARATOR));
          } else {
            source = project.name;
          }

          sankey_data.push({source: source, target: tag.name, value: tag.time});
        });
      });
      
      end(sankey_data);
    }
  );
}


function get_watson_data(end) {
  return new run_cmd('watson', ['report', '-G', '-j', '-f', '2019-04-24'],
    function (me, buffer) { me.stdout += buffer.toString() },
    end
  );
}

function run_cmd(cmd, args, cb, end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    this.stdout = "";
    child.stdout.on('data', function (buffer) { cb(me, buffer) });
    child.stdout.on('end', end);
}

module.exports = router;
