<template>
  <div id="app" :style="{ display: 'flex', textAlign: 'center' }">
    <div>
      <ColorPicker
        :color="color"
        :onStartChange="(color) => onChange(color, 'start')"
        :onChange="(color) => onChange(color, 'change')"
        :onEndChange="(color) => onChange(color, 'end')"
      />
    </div>
    <div>
      <div class="offset-wrapper">
        <ColorPicker
          class="gradient-picker"
          :can-add-gradient-point="true"
          :is-gradient="true"
          :onStartChange="(color) => onChange(color, 'start')"
          :onChange="(color) => onChange(color, 'change')"
          :onEndChange="(color) => onChange(color, 'end')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ColorPicker } from "./lib";

export default {
  name: "App",
  components: {
    ColorPicker,
  },

  data() {
    return {
      color: {
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
      },
    };
  },

  methods: {
    onChange(attrs, name) {
      this.color = { ...attrs };

      console.log(attrs, name);
    },
  },
};
</script>
<style lang="scss" scoped>
.offset-wrapper {
  position: absolute;
  top: 30px;
}
.gradient-picker {
  position: absolute;
  left: 800px;
}
</style>
<style src="@/lib/index.scss" lang="scss" />

