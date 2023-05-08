# Dm Color Picker

## Installation

To install, you can use [npm](https://npmjs.org/) or [yarn](https://yarnpkg.com):


    $ npm i dm-color-picker

### Color Picker
```vue
<template>
  <div id="app">
    <ColorPicker
      :color="color"
      :onStartChange="color => onChange(color, 'start')"
      :onChange="color => onChange(color, 'change')"
      :onEndChange="color => onChange(color, 'end')"
    />
  </div>
</template>

<script>
import { ColorPicker } from 'dm-color-picker';

export default {
  name: 'App',

  components: {
    ColorPicker
  },

  data()  {
    return {
      color: {
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1
      }
    }
  },   

  methods: {
    onChange(attrs, name) {
      this.color = { ...attrs };
    }
  }
}
</script>

<style src="dist/index.css" lang="css" />
```

### Gradient Color Picker
```vue
<template>
  <div id="app">
    <ColorPicker
      :gradient="gradient"
      :canAddGradientPoint="true"
      :isGradient="true"
      :onStartChange="color => onChange(color, 'start')"
      :onChange="color => onChange(color, 'change')"
      :onEndChange="color => onChange(color, 'end')"
    />
  </div>
</template>

<script>
import { ColorPicker } from 'dm-color-picker';

export default {
  name: 'App',

  components: {
    ColorPicker
  },

  data()  {
    return {
      gradient: {
        type: 'linear',
        degree: 0,
        points: [
          {
            left: 0,
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1
          },
          {
            left: 100,
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1
          }
        ]      
      }
    }
  },   

  methods: {
    onChange(attrs, name) {
      console.log(name);
    }
  }
}
</script>

<style src="dist/index.css" lang="css" />
```