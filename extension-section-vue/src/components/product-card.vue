<template>
    <div class="product">
        <h1>{product.name}</h1>
        <h2>{product.slug}</h2>
    </div>
</template>

<script>
export default {
    name: 'product-card',
    props: ['product'],
};
</script>

<style>
.product {
    color: red;
    border: 1px solid red;
}
</style>
