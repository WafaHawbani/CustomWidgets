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
        });
  
        const myChart = echarts.init(this._root, "wight");
        const option = {
            tooltip: {
                trigger: 'item'
              },
              legend: {
                top: '5%',
                left: 'center'
              },
              series: [
                {
                  name: 'Access From',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                  },
                  label: {
                    show: false,
                    position: 'center'
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 40,
                      fontWeight: 'bold'
                    }
                  },
                  labelLine: {
                    show: false
                  },
              data,
            },
          ],
        };
        myChart.setOption(option);
      }
    }
  
    customElements.define("com-sap-sample-echarts-nested_chart", NestedPieSamplePrepped);
  })();
