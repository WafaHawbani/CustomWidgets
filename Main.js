var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  }); 
};

//first step daclare var from library عشان تحمل بعض الملفات وتقبلها وتحلها always
//end this--

(function () { // 2 step fun for front end
  const parseMetadata = metadata => { //what we want to have at it يحدد وش يبي يطلع بالنهاية بالرسمة
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata 

    const dimensions = []
    for (const key in dimensionsMap) {
      const dimension = dimensionsMap[key]
      dimensions.push({ key, ...dimension })
    }

    const measures = []
    for (const key in measuresMap) {
      const measure = measuresMap[key]
      measures.push({ key, ...measure }) // push لأضافة عنصر جديد بالنهاية
    } // array


    return { dimensions, measures, dimensionsMap, measuresMap } // what will return
  }
//--end this--

  const appendTotal = (data) => {
    data = JSON.parse(JSON.stringify(data)) // نسخة من لبيانات
    const superRoot = {
      dimensions_0: { id: 'total', label: 'Total' },
      measures_0: { raw: 0 } //يبدأمن الصفر
    } // to display total
    data.forEach(data => {
      if (data.dimensions_0.parentId) { return } // يدور على كل البيانات لو هو موجود يعني فرعي
      data.dimensions_0.parentId = 'total'
      superRoot.measures_0.raw += data.measures_0.raw //يضيفه ليجمع الاجمالي
    })
    return [superRoot].concat(data)
  } // data المعدله

//--end this--

  class Renderer { //how to show it by echart library  
    constructor (root) {
      this._root = root
      this._echart = null
    }

    async render (dataBinding) {
      await getScriptPromisify("https://wafahawbani.github.io/CustomWidgets/Main.js"); // بشكل غير متزامن يحمل المكتبة (await يعني ينتظر لين تخلص)
      this.dispose() // ينظف اي شيء عليه

      if (dataBinding.state !== 'success') { return } // لو مانجت بيرجع

      let { data, metadata } = dataBinding // استخراج
      const { dimensions, measures } = parseMetadata(metadata) // يحولها لبيانات مناسبة

      const [dimension] = dimensions
      const [measure] = measures
      const nodes = []
      const links = []

      data = appendTotal(data)
      data.forEach(d => {
        const { label, id, parentId } = d[dimension.key]
        const { raw } = d[measure.key]
        nodes.push({ name: label }) // يطلع الروابط الازمه للرسم

        const dParent = data.find(d => {
          const { id } = d[dimension.key]
          return id === parentId
        })
        if (dParent) {
          const { label: labelParent } = dParent[dimension.key]
          links.push({
            source: labelParent,
            target: label,
            value: raw
          })
        }
      })
      this._echart = echarts.init(this._root) // واحد جديد
      // https://echarts.apache.org/examples/en/editor.html?c=sankey-levels
      // https://echarts.apache.org/en/option.html
      this._echart.setOption({ // ستايل
        title: {
          text: ''
        },
        tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
	  animation: false,
        series: [
        {
          type: 'sankey',
          emphasis: {
            focus: 'adjacency'
          },
          nodeAlign: 'right',
          data: data.nodes,
          links: data.links,
          lineStyle: {
            color: 'source',
            curveness: 0.5
          }
        }
      ]
      })
    }

    dispose () { // لتخفي اي تسريب مهم
      if (this._echart) {
        echarts.dispose(this._echart)
      } 
    }
  }

  const template = document.createElement('template') 
  template.innerHTML = `
  <style>
      #chart {
          width: 100%;
          height: 100%;
      }
  </style>
  <div id="root" style="width: 100%; height: 100%;">
      <div id="chart"></div>
  </div>
  `

  class Main extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' }) // ظل
      this._shadowRoot.appendChild(template.content.cloneNode(true)) // يضيفه
      this._root = this._shadowRoot.getElementById('root')
      this._renderer = new Renderer(this._root) يحطهم
    }

    // ------------------
    // LifecycleCallbacks دورة حياته
    // ------------------
    async onCustomWidgetBeforeUpdate (changedProps) { // قبل التحديث
    }

    async onCustomWidgetAfterUpdate (changedProps) { //بعد التحديث وتظهر التحديثات
      this.render()
    }

    async onCustomWidgetResize (width, height) { لما يتغير السايز وتستعدي عشان يجدده
      this.render()
    }

    async onCustomWidgetDestroy () { عشان يحرر الموارد
      this.dispose()
    }

    // ------------------
    //
    // ------------------
    render () {
      if (!document.contains(this)) { // اتأكد فيه او لا
        // Delay the render to assure the custom widget is appended on dom
        setTimeout(this.render.bind(this), 0) // اذا مو موجود زيد الوقت
        return
      }

      this._renderer.render(this.dataBinding) // موججود في دوم يتستعدعي
    }

    dispose () {
      this._renderer.dispose()// من التدمير عشان تلغيه
    }
  }

  customElements.define('com-sap-sac-sample-echarts-sankey', Main) //ربطه في json
})()

