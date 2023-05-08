import { useMouseEvents } from "@/lib/hooks";
import { updateGradientActivePercent } from "@/lib/helpers";

export default {
  name: "GradientPoint",

  props: {
    point: Object,
    activePointIndex: Number,
    index: Number,
    width: Number,
    positions: Object,
    changeActivePointIndex: Function,
    updateGradientLeft: Function,
    removePoint: Function,
  },

  data() {
    return {
      mouseEvents: () => { },
    }
  },

  mounted() {
    this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
  },

  computed: {
    activeClassName() {
      return this.activePointIndex === this.index ? ' active' : '';
    },

    pointStyle() {
      return { left: `${(this.point.left * (this.width / 100)) - 6}px`, }
    }
  },

  methods: {
    mouseDownHandler(event) {
      event.stopPropagation()
      this.changeActivePointIndex(this.index);

      const startX = event.target.offsetLeft;
      const startY = event.pageY;
      const offsetX = startX - this.positions.x;

      this.updateGradientLeft(this.point.left, this.index, 'onStartChange');

      return {
        startX,
        startY,
        offsetX,
        layerX: startX,
        mouseStatus: 'down'
      };
    },

    changeObjectPositions(event, { offsetX, layerX }) {
      const newLayerX = event.layerX

      const moveX = newLayerX - layerX;
      offsetX += moveX;
      // update point percent
      const left = updateGradientActivePercent(offsetX, this.width);

      return {
        positions: {
          offsetX,
          startX: event.pageX,
          layerX: newLayerX,
          pageX: event.pageX
        },
        left,
      };
    },

    mouseMoveHandler(event, { startX, offsetX, layerX }) {
      event.stopPropagation()
      const { positions, left } = this.changeObjectPositions(event, { startX, offsetX, layerX, mouseStatus: 'moving' });

      this.updateGradientLeft(left, this.index, 'onChange');

      return positions;
    },

    mouseUpHandler(event, { startX, offsetX, layerX, mouseStatus }) {
      event.stopPropagation()
      if (mouseStatus === 'down') {
        // 没有moving，无需更新
        return
      }
      const { positions, left } = this.changeObjectPositions(event, { startX, offsetX, layerX, mouseStatus: 'up' });

      this.updateGradientLeft(left, this.index, 'onEndChange');

      return positions;
    },
  }
};
