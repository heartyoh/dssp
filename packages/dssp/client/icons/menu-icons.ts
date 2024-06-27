const ICON_PROGRESS = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 40 40">
  <defs>
    <style>
      .menu-svg {
        fill: #fff;
				stroke: {{strokecolor}};
        stroke-width: 0px;
      }
    </style>
  </defs>
  
    <path class="menu-svg" d="M31,36.5c-.2,0-.4,0-.6,0-.2,0-.3-.2-.5-.3l-8.3-8.3c-.2-.2-.3-.3-.3-.5,0-.2,0-.4,0-.6s0-.4,0-.6c0-.2.2-.3.3-.5l3.1-3.1c.2-.2.3-.3.5-.3.2,0,.4,0,.6,0s.4,0,.6,0c.2,0,.3.2.5.3l8.3,8.3c.2.2.3.3.3.5,0,.2,0,.4,0,.6s0,.4,0,.6c0,.2-.2.3-.3.5l-3.1,3.1c-.2.2-.3.3-.5.3-.2,0-.4,0-.6,0ZM31,33.6l1.8-1.8-6.9-6.9-1.8,1.8,6.9,6.9ZM8.9,36.5c-.2,0-.4,0-.6-.1-.2,0-.3-.2-.5-.3l-3.1-3.1c-.2-.2-.3-.3-.3-.5,0-.2-.1-.4-.1-.6s0-.4.1-.6c0-.2.2-.3.3-.5l8.6-8.6h3.5l1.3-1.3-6.9-6.9h-2.4l-4.6-4.6,4.1-4.1,4.6,4.6v2.4l6.9,6.9,4.9-4.9-2.4-2.4,2.1-2.1h-4.2l-.9-.9,5.3-5.3.9.9v4.2l2.1-2.1,6.2,6.2c.4.4.8.9,1,1.5.2.5.3,1.1.3,1.7s0,1-.3,1.5c-.2.5-.5.9-.8,1.4l-3.5-3.5-2.3,2.3-1.8-1.8-8,8v3.5l-8.6,8.6c-.2.2-.3.3-.5.3-.2,0-.4.1-.6.1ZM8.9,33.6l7.6-7.6v-1.8h-1.8l-7.6,7.6,1.8,1.8ZM8.9,33.6l-1.8-1.8.9.9.9.9ZM31,33.6l1.8-1.8-1.8,1.8Z"/>
</svg>
`

const ICON_COMPLETED = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 40 40">
  <defs>
    <style>
      .menu-svg {
        fill: #fff;
				stroke: {{strokecolor}};
        stroke-width: 0px;
      }
    </style>
  </defs>
  
  <path class="menu-svg" d="M27.9,15.1h2.7v-2.8h-2.7v2.8ZM27.9,21.4h2.7v-2.8h-2.7v2.8ZM27.9,27.7h2.7v-2.8h-2.7v2.8ZM26.9,33.3v-2.4h6.9V9h-14.2v2.8l-2.3-1.7v-3.5h18.7v26.7s-9.1,0-9.1,0ZM4,33.3v-14.5l9.9-7.3,9.9,7.3v14.5h-8.1v-7.5h-3.5v7.5H4ZM6.3,31h3.6v-7.5h8v7.5h3.6v-11l-7.7-5.5-7.7,5.5v11h0ZM18,31v-7.5h-8v7.5-7.5h8v7.5Z"/>
</svg>
`

const ICON_STATUS = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 40 40">
  <defs>
    <style>
      .menu-svg {
        fill: #fff;
				stroke: {{strokecolor}};
        stroke-width: 0px;
      }
    </style>
  </defs>

  <path class="menu-svg" d="M7.4,33.9c-.8,0-1.5-.3-2.1-.8-.6-.6-.8-1.3-.8-2.1V9c0-.8.3-1.5.8-2.1.6-.6,1.3-.8,2.1-.8h25.2c.8,0,1.5.3,2.1.8s.8,1.3.8,2.1v21.9c0,.8-.3,1.5-.8,2.1s-1.3.8-2.1.8H7.4ZM7.4,31.4h25.2c0,0,.3,0,.4-.2,0,0,.2-.2.2-.4V9c0,0,0-.3-.2-.4,0,0-.2-.2-.4-.2H7.4c0,0-.3,0-.4.2,0,0-.2.2-.2.4v21.9c0,0,0,.3.2.4,0,0,.2.2.4.2h0ZM8.9,27.7h7.3v-2.4h-7.3v2.4ZM24.2,24.3l7.5-7.5-1.8-1.8-5.7,5.8-2.4-2.4-1.7,1.8s4.1,4.1,4.1,4.1ZM8.9,21.2h7.3v-2.4h-7.3v2.4ZM8.9,14.6h7.3v-2.4h-7.3s0,2.4,0,2.4ZM6.9,31.4V8.5v22.9Z"/>
</svg>
`

const ICON_OPERATING = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 40 40">
  <defs>
    <style>
      .menu-svg {
        fill: #fff;
				stroke: {{strokecolor}};
        stroke-width: 0px;
      }
    </style>
  </defs>
    
  <path class="menu-svg" d="M9.1,35.5c-.8,0-1.5-.3-2.1-.8-.6-.6-.8-1.2-.8-2.1V10.9c0-.8.3-1.5.8-2.1.6-.6,1.2-.8,2.1-.8h2.3v-3.5h2.5v3.5h12.3v-3.5h2.4v3.5h2.3c.8,0,1.5.3,2.1.8.6.6.8,1.2.8,2.1v21.7c0,.8-.3,1.5-.8,2.1s-1.2.8-2.1.8c0,0-21.8,0-21.8,0ZM9.1,33.1h21.7c0,0,.3,0,.4-.2,0,0,.2-.2.2-.4v-15.2H8.5v15.2c0,0,0,.3.2.4,0,0,.2.2.4.2ZM8.5,14.9h22.7v-4c0,0,0-.3-.2-.4,0,0-.2-.2-.4-.2H9.1c0,0-.3,0-.4.2,0,0-.2.2-.2.4,0,0,0,4,0,4ZM8.5,14.9v-4.5,4.5ZM12.2,22.9v-2.4h15.4v2.4s-15.4,0-15.4,0ZM12.2,29.4v-2.4h10.5v2.4h-10.5Z"/>
</svg>
`

const ICON_SETTING = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 40 40">
  <defs>
    <style>
      .menu-svg {
        fill: #fff;
				stroke: {{strokecolor}};
        stroke-width: 0px;
      }
    </style>
  </defs>
  
  <path class="menu-svg" d="M13.1,24.2h2v-5.7h-2v1.9h-2.4v2h2.4v1.9h0ZM16.7,22.3h12.8v-2h-12.8v2ZM25,18.1h2v-1.9h2.4v-2h-2.4v-1.9h-2v5.7h0ZM10.6,16.2h12.8v-2h-12.8v2ZM14.3,34v-3.3h-6.9c-.8,0-1.5-.3-2.1-.8s-.8-1.3-.8-2.1V8.9c0-.8.3-1.6.8-2.1.6-.5,1.3-.8,2.1-.8h25.2c.8,0,1.5.3,2.1.8s.8,1.3.8,2.1v18.8c0,.8-.3,1.6-.8,2.1-.6.5-1.3.8-2.1.8h-6.9v3.3h-11.5,0ZM7.5,28.2h25.2c0,0,.3,0,.4-.2,0,0,.2-.2.2-.4V8.9c0,0,0-.3-.2-.4,0,0-.2-.2-.4-.2H7.5c0,0-.3,0-.4.2,0,0-.2.2-.2.4v18.8c0,0,0,.3.2.4,0,0,.2.2.4.2h0ZM6.9,28.2V8.4v19.8Z"/>
</svg>
`

function icons(template) {
  return ['#ffffff', '#64A3D9'].map(
    color => 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(template.replace(/{{strokecolor}}/g, color))
  )
}

export const ICONS_PROGRESS = icons(ICON_PROGRESS)
export const ICONS_COMPLETED = icons(ICON_COMPLETED)
export const ICONS_STATUS = icons(ICON_STATUS)
export const ICONS_OPERATING = icons(ICON_OPERATING)
export const ICONS_SETTING = icons(ICON_SETTING)
