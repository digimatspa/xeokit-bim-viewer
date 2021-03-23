import {Section} from "./Section.js";
import {utils} from "@xeokit/xeokit-sdk/src/viewer/scene/utils.js";


function _httpRequest(args) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/xml')
        xhr.open(args.method || "GET", args.url, true);
        xhr.onload = function (e) {
            console.log(args.url, xhr.readyState, xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseXML);
                } else {
                    reject(xhr.statusText);
                }
            }
        };
        xhr.send(null);
    });
}

class MetaDataRenderer {

    constructor(args = {}) {
        this.models = {};
        this.domNode = document.getElementById(args.domNode);
        this.setSelected([]);
    }

    addModel(args) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (args.model) {
                self.models[args.id] = args.model;
                resolve(args.model);
            } else {
                self.loadModelFromSource(args.src).then(function(m) {
                    self.models[args.id] = m;
                    resolve(m);
                });
            }
        });
    }
    
    renderAttributes(elem) {
        var s = new Section({domNode:this.domNode});
        s.setName(elem.type || elem.getType());
        ["GlobalId", "Name", "OverallWidth", "OverallHeight", "Tag"].forEach(function(k) {
            var v = elem[k];
            if (typeof(v) === 'undefined') {
                var fn = elem["get"+k];
                if (fn) {
                    v = fn.apply(elem);
                }
            }
            if (typeof(v) !== 'undefined') {
                var r = s.addRow();
                r.setName(k);
                r.setValue(v);
            }
        });
        return s;
    }
    
    renderPSet(pset) {
        var s = new Section({domNode:this.domNode});
        if (pset.name && pset.children) {
            s.setName(pset.name);
            pset.children.forEach(function(v) {
                var r = s.addRow();
                r.setName(v.name);
                r.setValue(v.NominalValue);
            });
        } else {
            pset.getName(function(name) {
                s.setName(name);
            });
            var render = function(prop, index, row) {
                var r = row || s.addRow();
                prop.getName(function(name) {
                    r.setName(name);
                });
                if (prop.getNominalValue) {
                    prop.getNominalValue(function(value) {
                        r.setValue(value._v);
                    });
                }
                if (prop.getHasProperties) {
                    prop.getHasProperties(function(prop, index) {
                        render(prop, index, r);
                    });
                }
            };
            pset.getHasProperties(render);
        }
        return s;
    }
    
    setSelected(oid) {
        if (oid.length !== 1) {
            this.domNode.innerHTML = "&nbsp;<br>Select a single element in order to see object properties."
            return;
        };

        let self = this;
        this.domNode.innerHTML = "";
        
        oid = oid[0];
        
        if (oid.indexOf(':') !== -1) {
            oid = oid.split(':');
            var model = this.models[oid[0]].model || models[oid[0]].apiModel;
            var o = model.objects[oid[1]];
        
            this.renderAttributes(o);

            o.properties.forEach(function(pset) {
                self.renderPSet(pset);
            });
            
            /*o.getIsDefinedBy(function(isDefinedBy){
                if (isDefinedBy.getType() == "IfcRelDefinesByProperties") {
                    isDefinedBy.getRelatingPropertyDefinition(function(pset){
                        if (pset.getType() == "IfcPropertySet") {
                            this.renderPSet(pset);
                        }
                    });
                }
            });*/
        } else {
            var o = this.models["1"].model.objects[oid];
            this.renderAttributes(o);
            o.properties.forEach(function(pset) {
                self.renderPSet(pset);
            });
        }
    }

    loadModelFromSource(src) {
        return new Promise(function (resolve, reject) {
            _httpRequest({url: src}).then(function(xml) {
                var json = utils.xmlToJson(xml, {'Name': 'name', 'id': 'guid'});
                
                var psets = utils.findNodeOfType(json, "properties")[0];
                var project = utils.findNodeOfType(json, "decomposition")[0].children[0];
                var types = utils.findNodeOfType(json, "types")[0];
                
                var objects = {};
                var typeObjects = {};
                var properties = {};
                psets.children.forEach(function(pset) {
                    properties[pset.guid] = pset;
                });
                
                var visitObject = function(parent, node) {
                    var props = [];
                    var o = (parent && parent.ObjectPlacement) ? objects : typeObjects;
                    
                    if (node["xlink:href"]) {
                        if (!o[parent.guid]) {
                            var p = utils.clone(parent);
                            p.GlobalId = p.guid;
                            o[p.guid] = p;
                            o[p.guid].properties = []
                        }
                        var g = node["xlink:href"].substr(1);
                        var p = properties[g];
                        if (p) {
                            o[parent.guid].properties.push(p);
                        } else if (typeObjects[g]) {
                            // If not a pset, it is a type, so concatenate type props
                            o[parent.guid].properties = o[parent.guid].properties.concat(typeObjects[g].properties);
                        }
                    }
                    node.children.forEach(function(n) {
                        visitObject(node, n);
                    });
                };
                
                visitObject(null, types);
                visitObject(null, project);
                
                resolve({model: {objects: objects, source: 'XML'}});
            });
        });
    }

}

export {MetaDataRenderer};