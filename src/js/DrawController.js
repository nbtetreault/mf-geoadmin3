(function() {
  goog.provide('ga_draw_controller');

  goog.require('ga_urlutils_service');

  var module = angular.module('ga_draw_controller', [
    'ga_urlutils_service',
    'pascalprecht.translate'
  ]);

  module.controller('GaDrawController',
      function($scope, $translate, gaGlobalOptions, $http, $rootScope, gaUrlUtils, $document) {
        $scope.options = {
          waitClass: 'ga-draw-wait',
          tools:[
            {id: 'point'},
            {id: 'line'},
            {id: 'polygon'},
            {id: 'text'},
            {id: 'modify'},
            {id: 'delete'}
          ],
          colors: [
            {name:'black', value:[0, 0, 0]},
            {name:'white', value:[255, 255, 255]},
            {name:'red', value:[255, 0, 0]},
            {name:'blue', value:[0, 0, 255]},
            {name:'green', value:[0, 255, 0]}
          ],
        };
        
        // Set default color
        $scope.options.color = $scope.options.colors[2];

        // Define tools identifiers
        for (var i = 0, ii = $scope.options.tools.length; i < ii; i++) {
          var tool = $scope.options.tools[i];
          tool.options = 'is' + tool.id.charAt(0).toUpperCase() + tool.id.slice(1) + 'Active';
          tool.class = 'ga-draw-' + tool.id + '-bt';
          tool.title = 'draw_' + tool.id;
          tool.description = 'draw_' + tool.id + '_description';
          tool.instructions = 'draw_' + tool.id + '_instructions';
        }

        
        // Define layer style function
        $scope.options.styleFunction = (function() {
          return function(feature, resolution) {
            var styles = {};
            
            if (!$scope.options.color) {
              $scope.options.color = $scope.options.colors[2]; 
            }
            var fill = new ol.style.Fill({
              color: $scope.options.color.value.concat([0.4]) || [255, 0, 0, 0.4]
            })
            var stroke = new ol.style.Stroke({
              color: $scope.options.color.value.concat([1]) || [255, 0, 0, 1],
              width: 3
            });
            var circleStroke = new ol.style.Stroke({
              color: stroke.getColor(),
              width: 2
            });
            
            var text;
            if ($scope.options.isTextActive && $scope.options.text) {
              text = new ol.style.Text({
                font: '16px Calibri,sans-serif',
                text: $scope.options.text,
                fill: new ol.style.Fill({
                  color: $scope.options.color.value.concat([1]) || [0, 0, 0, 1]
                }),
                stroke: new ol.style.Stroke({
                  color: '#fff',
                  width: 3
                })
              });
            }

            
            styles['Polygon'] = [
              new ol.style.Style({
                fill: fill,
                stroke: stroke,
                text: text
              })
            ];
            styles['Point'] = [
              new ol.style.Style({
                image: (text) ? new ol.style.Circle({
                  radius: 2,
                  fill: new ol.style.Fill({color:'#000000aa'}),
                  stroke: new ol.style.Stroke({color:'#000000aa'})
                }) : new ol.style.Circle({
                  radius: 4,
                  fill: fill,
                  stroke: circleStroke
                }),
                text: text
              })
            ];

            styles['MultiPolygon'] = styles['Polygon'];
            styles['LineString'] = styles['Polygon'];
            styles['MultiLineString'] = styles['LineString'];
            styles['MultiPoint'] = styles['Point'];

            if (feature.getStyleFunction()) {
              return feature.getStyleFunction()(resolution); 
            }
            return styles[feature.getGeometry().getType()];
          };
        })()

        $scope.options.drawStyleFunction = (function() {
          return function(feature, resolution) {
            var styles;
            if (feature.getGeometry().getType() === 'Polygon') {
              styles =  [
                new ol.style.Style({
                  fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.4]
                  }),
                  stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 0],
                    width: 0
                  })
                })
              ];
            } else {
              styles = $scope.options.styleFunction(feature, resolution);
            }
            return styles;
          }
        })();
         
        $scope.options.selectStyleFunction = (function() {
          return function(feature, resolution) {
            if (!feature.getStyleFunction()) {
              return [];
            }
            var styles = feature.getStyleFunction()(resolution);
            var style = styles[0];
            var fill = new ol.style.Fill({
              color: [255, 255, 255, 0.4]
            });
            var stroke = new ol.style.Stroke({
              color: [255, 255, 255, 0.6],
              width: 3 
            });

            var text = style.getText();
            return [
              new ol.style.Style({
                fill: fill,
                stroke: stroke,
                text: (text) ? new ol.style.Text({
                  font: text.getFont(),
                  text: text.getText(),
                  fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.6]
                  }),
                  stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 0.6],
                    width: 3
                  })
                }) : text,
                image: (text) ? style.getImage() :
                  new ol.style.Circle({
                    radius: 4,
                    fill: fill,
                    stroke: stroke
                  }) 
              })
            ];
          }
        })();
      });
})();
