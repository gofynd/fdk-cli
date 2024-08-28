import * as ProductListing from './sections/product-listing.vue';
function exportComponents(components) {
    return [
        {
            name: 'product-listing',
            label: 'product-listing',
            component: components[0].default,
        },
    ];
}
export default exportComponents([ProductListing]);
