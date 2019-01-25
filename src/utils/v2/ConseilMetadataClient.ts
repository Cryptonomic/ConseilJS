/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export class ConseilMetadataClient {
    async executeMetadataQuery(apiKey: string, server: string, route: string): Promise<object> {
        return fetch(`${server}/v2/metadata/${route}`, {
            method: 'GET',
            headers: { "apiKey": apiKey },
        }).then(response => {return response.json()});
    }

    async getPlatforms(server: string, apiKey: string): Promise<object> {
        return this.executeMetadataQuery(server, 'platforms', apiKey);
    }

    async getNetworks(server: string, apiKey: string, platform: string): Promise<object> {
        return this.executeMetadataQuery(server, `${platform}/networks`, apiKey);
    }

    async getEntities(server: string, apiKey: string, platform: string, network: string): Promise<object> {
        return this.executeMetadataQuery(server, `${platform}/${network}/entities`, apiKey);
    }

    async getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<object> {
        return this.executeMetadataQuery(server, `${platform}/${network}/${entity}/attributes`, apiKey);
    }

    async getElements(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<object> {
        return this.executeMetadataQuery(server, `${platform}/${network}/${entity}/${attribute}`, apiKey);
    }
}
