import {utils} from "@xeokit/xeokit-sdk/src/viewer/scene/utils.js";
import {MetaDataRenderer} from "../metadata/MetaDataRenderer.js"

/**
 * Default server client which loads content for a {@link BIMViewer} via HTTP from the file system.
 *
 * A BIMViewer is instantiated with an instance of this class.
 *
 * To load content from an alternative source, instantiate BIMViewer with your own custom implementation of this class.
 */
class Server {

    /**
     * Constructs a Server.
     *
     * @param {*} [cfg] Server configuration.
     * @param {String} [cfg.dataDir] Base directory for content.
     */
    constructor(cfg = {}) {
        this._dataDir = cfg.dataDir || "";
        this.metaDataRenderers = {};
        this.metadataRendererElement = cfg.metadataRendererElement || null;
    }

    /**
     * Gets information on all available projects.
     *
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getProjects(done, error) {
        const url = this._dataDir + "/index.json";
        utils.loadJSON(url, done, error);
    }

    /**
     * Gets information for a project.
     *
     * @param {String} projectId ID of the project.
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getProject(projectId, done, error) {
        const url = this._dataDir + "/" + projectId + "/index.json";
        utils.loadJSON(url, done, error);
    }

    /**
     * Gets metadata for a model within a project.
     *
     * @param {String} projectId ID of the project.
     * @param {String} modelId ID of the model.
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getMetadata(projectId, modelId, done, error) {
        try {
            //cache the metadata renderer
            this.getMetadataRenderer(projectId, modelId, true);
        } catch (e) {
            console.error(e, e.stack);
        }

        const url = this._dataDir + "/" + projectId + "/models/" + modelId + "/metadata.json";
        utils.loadJSON(url, done, error);
    }

    /**
     * Gets geometry for a model within a project.
     *
     * @param {String} projectId ID of the project.
     * @param {String} modelId ID of the model.
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getGeometry(projectId, modelId, done, error) {
        const url = this._dataDir + "/" + projectId + "/models/" + modelId + "/geometry.xkt";
        utils.loadArraybuffer(url, done, error);
    }

    /**
     * Gets metadata for an object within a model within a project.
     *
     * @param {String} projectId ID of the project.
     * @param {String} modelId ID of the model.
     * @param {String} objectId ID of the object.
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getObjectInfo(projectId, modelId, objectId, done, error) {
        var renderer = this.getMetadataRenderer(projectId, modelId, false);
        if(renderer){
            renderer.setSelected([modelId + ":" + objectId]);
        }
    }

    /**
     * Gets existing issues for a model within a project.
     *
     * @param {String} projectId ID of the project.
     * @param {String} modelId ID of the model.
     * @param {Function} done Callback through which the JSON result is returned.
     * @param {Function} error Callback through which an error message is returned on error.
     */
    getIssues(projectId, modelId, done, error) {
        const url = this._dataDir + "/" + projectId + "/models/" + modelId + "/issues.json";
        utils.loadJSON(url, done, error);
    }

    /**
     * Return the specified metadata renderer according to modelId
     *
     * @param {String} projectId ID of the project.
     * @param {String} modelId ID of the model.
     * @param {Boolean} create if true, missing metadata renderer is created.
     */
    getMetadataRenderer(projectId, modelId, create){
        var renderer = null;

        // Create metadata renderer, if requested
        if (create && !this.metaDataRenderers.projectId) {
                this.metaDataRenderers.projectId = {};
        }

        if (create && !this.metaDataRenderers.projectId.modelId){
            this.metaDataRenderers.projectId.modelId = new MetaDataRenderer({
                                                            domNode: this.metadataRendererElement
                                                        });
            var url = this._dataDir + "/" + projectId + "/models/" + modelId + "/metadata.xml";
            this.metaDataRenderers.projectId.modelId.addModel({src: url, id: modelId});
        }

        if(this.metaDataRenderers.projectId && this.metaDataRenderers.projectId.modelId) {
            renderer = this.metaDataRenderers.projectId.modelId;
        }

        return renderer;
    }
}

export {Server};