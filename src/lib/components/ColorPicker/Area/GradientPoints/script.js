import GradientPoint from './GradientPoint';

import { generateGradientStyle, updateGradientActivePercent } from "@/lib/helpers";

export default {
  name: "index",

  props: {
    canAddGradientPoint: Boolean,
    points: Array,
    activePointIndex: Number,
    changeActivePointIndex: Function,
    updateGradientLeft: Function,
    addPoint: Function,
    removePoint: Function,
  },

  data() {
    return {
      width: 0,
      positions: { x: 0, y: 0 }
    }
  },

  components: {
    GradientPoint
  },

  mounted() {
    const pointer = this.$refs.pointsContainerRef;

    if (pointer) {
      this.width = pointer.clientWidth;

      // const pointerPos = pointer.getBoundingClientRect();

      this.positions = { x: pointer.offsetLeft, y: pointer.offsetTop };
    }
  },

  computed: {
    pointsStyle() {
      const style = generateGradientStyle(this.points, 'linear', 90);

      return { background: style };
    }
  },

  methods: {
    pointsContainerClick(event) {
      if (!this.canAddGradientPoint) return
      const left = updateGradientActivePercent(event.layerX, this.width);

      this.addPoint(left);
    },
  }
};
