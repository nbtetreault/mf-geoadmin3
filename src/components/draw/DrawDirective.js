(function() {
  goog.provide('ga_draw_directive');

  goog.require('ga_map_service');

  var module = angular.module('ga_draw_directive', [
    'pascalprecht.translate'
  ]);

  module.directive('gaDraw',
    function($rootScope, gaDefinePropertiesForLayer, $translate, $document, gaDebounce) {
      return {
        restrict: 'A',
        templateUrl: function(element, attrs) {
          return 'components/draw/partials/draw.html';
        },
        scope: {
          map: '=gaDrawMap',
          options: '=gaDrawOptions',
          isActive: '=gaDrawActive'
        },
        link: function(scope, elt, attrs, controller) {
          var draw, modify, select, deregister, sketchFeature;
          var map = scope.map;
          var styleFunction = scope.options.styleFunction;
          var source = new ol.source.Vector();
          var layer = new ol.layer.Vector({
            source: source,
            visible: true,
            styleFunction: styleFunction
          });
          gaDefinePropertiesForLayer(layer);
          layer.highlight = true;


          // On draw end assign the style to the feature

          // Activate the component: add listeners, last features drawn and draw
          // interaction.
          var activate = function() {
            map.addLayer(layer);
            if (draw) {
              map.addInteraction(draw);
            }
          };


          // Deactivate the component: remove listeners, features and draw
          // interaction.
          var deactivate = function() {

            // Remove layer
            if (layer) {
              map.removeLayer(layer);
            }

            // Remove events
            if (deregister) {
              for (var i = deregister.length - 1; i >= 0; i--) {
                deregister[i].src.unByKey(deregister[i]);
              }
            }

            // Remove interactions
            deactivateDrawInteraction();
            deactivateSelectInteraction();
            deactivateModifyInteraction();
          };

          // Deactivate other tools
          scope.activateTool = function(tool) {
            var tools = scope.options.tools;
            for (var i = 0, ii = tools.length; i < ii; i++) {
              scope.options[tools[i].options] = (tools[i].id == tool.id);
            }
            scope.options.instructions = tool.instructions;
          };

          // Set the draw interaction with the good geometry
          var activateDrawInteraction = function(type) {
             deactivateDrawInteraction();
             deactivateSelectInteraction();
             deactivateModifyInteraction();

             draw = new ol.interaction.Draw({
              type: type,
              source: source,
              styleFunction: scope.options.drawStyleFunction
            });

            deregister = [
                draw.on('drawstart', function(evt) {
                  sketchFeature = evt.feature;
                }),
                draw.on('drawend', function(evt) {
                  // Set the definitve style of the feature
                  var style = layer.getStyleFunction()(sketchFeature);
                  sketchFeature.setStyleFunction(
                    function(resolution) {
                      return style;
                    }
                  );
                })
              ];

            if (scope.isActive) {
              map.addInteraction(draw);
            }
          };

          // Set the select interaction
          var activateSelectInteraction = function() {
            deactivateDrawInteraction();
            deactivateSelectInteraction();
            deactivateModifyInteraction();

            select = new ol.interaction.Select({
              layer: layer,
              featuresOverlay: new ol.render.FeaturesOverlay({
                styleFunction: scope.options.selectStyleFunction
              })
            });

            deregister = [
            ];
            if (scope.isActive) {
              map.addInteraction(select);
            }
          };

          var deactivateDrawInteraction = function() {
            if (draw) {
              map.removeInteraction(draw);
            }
          };

          var deactivateModifyInteraction = function() {
            if (modify) {
              map.removeInteraction(modify);
            }
          };
          var deactivateSelectInteraction = function() {
            if (select) {
              map.removeInteraction(select);
            }
          };

          var updateSelectedFeatures = function() {
            if (select && select.getFeaturesOverlay().getFeatures().getLength() > 0) {
              var features = select.getFeaturesOverlay().getFeatures();
              features.forEach(function(feature) {
                feature.setStyleFunction(null);
                // Set the definitve style of the feature
                var style = layer.getStyleFunction()(feature);
                feature.setStyleFunction(
                  function(resolution) {
                    return style;
                  }
                );
              });
            }
          };
          // Scope functions
          scope.deleteFeatures = function() {
            if (select && select.getFeaturesOverlay().getFeatures().getLength() > 0 &&
                confirm($translate('confirm_remove_selected_features'))) {
              var features = select.getFeaturesOverlay().getFeatures();
              features.forEach(function(feature) {
                layer.getSource().removeFeature(feature);
              });
              select.getFeaturesOverlay().getFeatures().clear();
            } else if (confirm($translate('confirm_remove_all_features'))) {
                layer.getSource().clear();
            }
          };

          // Watchers
          scope.$watch('isActive', function(active) {
            $rootScope.isDrawActive = active;
            if (active) {
              activate();
            } else {
              deactivate();
            }
          });
          scope.$watch('options.color', function(active) {
            if (scope.options.isModifyActive) {
              updateSelectedFeatures();
            }
          });
          scope.$watch('options.isPointActive', function(active) {
            if (active) {
              activateDrawInteraction('Point');
            } else {
            }
          });
          scope.$watch('options.isLineActive', function(active) {
            if (active) {
              activateDrawInteraction('LineString');
            } else {
            }
          });
          scope.$watch('options.isPolygonActive', function(active) {
            if (active) {
              activateDrawInteraction('Polygon');
            } else {
            }
          });
          scope.$watch('options.isTextActive', function(active) {
            if (active) {
              activateDrawInteraction('Point');
            } else {
            }
          });
          scope.$watch('options.isModifyActive', function(active) {
            if (active) {
               activateSelectInteraction();
            } else {
            }
          });
          scope.$watch('options.isDeleteActive', function(active) {
            if (active) {
              activateSelectInteraction();
            } else {
            }
          });
        }
      };
    }
  );
})();
