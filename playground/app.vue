<template>
  <a>I'm a link with icon!</a>
  <br>
  <NuxtPage />
</template>
<style scoped>
  a:before {
    content: var(--icon-font-house);
    font-family: "icon-font";
  }
</style>
