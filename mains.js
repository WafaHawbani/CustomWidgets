var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};
 
(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
<style>
</style>
<div id="root" style="width: 100%; height: 100%;">
</div>
      `;
  class NestedPieSamplePrepped extends HTMLElement {
    constructor() {
      super();
 
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));
 
      this._root = this._shadowRoot.getElementById("root");
 
      this._props = {};
 
      this.render();
    }
 
    onCustomWidgetResize(width, height) {
      this.render();
    }
 
    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      this.render();
    }
 
    async render() {
      await getScriptPromisify(
        "https://dasarimadhusapbo.github.io/SankeyWidget/echarts.min.js"
      );
 
      if (!this._myDataSource || this._myDataSource.state !== "success") {
        return;
      }
 
      const dimension = this._myDataSource.metadata.feeds.dimensions.values[0];
      const measure = this._myDataSource.metadata.feeds.measures.values[0];
      const data = this._myDataSource.data.map((data) => {
        return {
          name: data[dimension].label,
          value: data[measure].raw,
        };
      }).sort(function(a, b){
        return a.value - b.value
      })
 
      const myChart = echarts.init(this._root, "wight");
      const option = {
		    backgroundColor: '#ffffff',
        title: {
          text: 'Customized Pie',
          left: 'center',
          top: 20,
          textStyle: {
            color: '#00000'
          }
        },
        tooltip: {
		trigger: 'item'
		},
		visualMap: {
		show: false,
		min: 80,
		max: 600,
		inRange: {
      colorLightness: [0, 1]
		}
		},
		series: [
          {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data,
         
            roseType: 'radius',
            label: {
              color: 'rgba(255, 255, 255, 0.3)'
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              smooth: 0.2,
              length: 10,
              length2: 20
            },
            itemStyle: {
                color: '#c23531',
              shadowBlur: 200,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
            
          }
        ]
      };
      myChart.setOption(option);
    }
  }
 
  customElements.define("com-sap-sample-echarts-nested_chart", NestedPieSamplePrepped);
})();