/* global _ */

/*
 * Complex scripted Logstash dashboard
 * This script generates a dashboard object that Kibana can load. It also takes a number of user
 * supplied URL parameters, none are required:
 *
 * index :: Which index to search? If this is specified, interval is set to 'none'
 * pattern :: Does nothing if index is specified. Set a timestamped index pattern. Default: [logstash-]YYYY.MM.DD
 * interval :: Sets the index interval (eg: day,week,month,year), Default: day
 *
 * split :: The character to split the queries on Default: ','
 * query :: By default, a comma separated list of queries to run. Default: *
 *
 * from :: Search this amount of time back, eg 15m, 1h, 2d. Default: 15m
 * timefield :: The field containing the time to filter on, Default: @timestamp
 *
 * fields :: comma separated list of fields to show in the table
 * sort :: comma separated field to sort on, and direction, eg sort=@timestamp,desc
 *
 */

'use strict';

// Setup some variables
var dashboard, queries, _d_timespan;

// All url parameters are available via the ARGS object
var ARGS;

// Set a default timespan if one isn't specified
// _d_timespan = '1d';

dashboard = {
  rows : [],
  services : {},
  editable: true
};

// Set a title
dashboard.title = 'Log Search';
dashboard.failover = false;
dashboard.index = {
  default: 'loglines',
  interval: 'none'
};

queries = {
  0: {
    query: '*',
    id: 0
  }
};

// Now populate the query service with our objects
dashboard.services.query = {
  list : queries,
  ids : _.map(_.keys(queries),function(v){return parseInt(v,10);})
};

dashboard.services.filter = {
  list: {
    0: {
      "type": "terms",
      "field": "request_type",
      "value": "publish",
      "mandate": "must",
      "active": !_.isUndefined(ARGS.publish),
      "alias": "",
      "id": 0
    },
    1: {
      "type": "terms",
      "field": "request_type",
      "value": "subscribe",
      "mandate": "must",
      "active": !_.isUndefined(ARGS.subscribe),
      "alias": "",
      "id": 0
    }
  },
  ids: [0,1]
};

dashboard.rows = [
  {
    title: "",
    "editable": false,
      "collapse": false,
      "collapsable": false,
  },
  {
    title: "",
    "editable": false,
      "collapse": false,
      "collapsable": false,
  }
];

dashboard.rows[1].panels = [
  {
    "error": false,
    "span": 12,
    "editable": true,
    "type": "table",
    "loadingEditor": false,
    "size": 100,
    "pages": 10,
    "offset": 0,
    "sort": [
      "timestamp",
      "desc"
    ],
    "overflow": "min-height",
    "fields": [], //display all fields
    "highlight": [],
    "sortable": true,
    "header": true,
    "paging":true,
    "field_list": true, // try to display fields on left
    "all_fields": false,
    "trimFactor": 300,
    "localTime": false,
    // "timeField"
    "spyable": false,
    "queries": {
      "mode": "all",
      "ids": [0]
    },
    "style": {
      "font-size": "10pt"
    },
    "normTimes": true,
    "title": "IPs"  
    
  }
];




// And a table row where you can specify field and sort order
dashboard.rows[0].panels = [
]

if(!_.isUndefined(ARGS.sub_key)) {
  dashboard.rows[0].panels.push({
    title: 'Subkey',
    type: 'text',
    mode: 'markdown',
    content: 'filtering by subkey: *' + ARGS.sub_key + '*',
    span: 3
  });

}

if (!_.isUndefined(ARGS.publish)) {
  dashboard.rows[0].panels.push({
  title: "Top publishes from IPs",
  type: "terms",
  field: "client_ip",
  chart: 'table',
  span: 4,
  spyable: false
  });
}
  
if (!_.isUndefined(ARGS.subscribe)) {
  dashboard.rows[0].panels.push({
    title: "Top subscribes from IPs",
    type: "terms",
    field: "client_ip",
    chart: 'table',
    span: 4,
    spyable: false
  });
}

// Now return the object and we're good!
return dashboard;
