const ICON_LOCATION = `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 24.094 24.094" style="enable-background:new 0 0 24.094 24.094;" xml:space="preserve">
<g style="opacity:0.12;">
	<circle cx="12.047" cy="12.047" r="12.047"/>
</g>
<g>
	<path style="fill:#FFFFFF;" d="M12.047,20.048c-4.411,0-8-3.589-8-8c0-4.411,3.589-8,8-8s8,3.589,8,8
		C20.047,16.459,16.458,20.048,12.047,20.048z"/>
	<path style="fill:{{fillcolor}};" d="M12.047,6.047c3.308,0,6,2.692,6,6s-2.692,6-6,6s-6-2.692-6-6S8.739,6.047,12.047,6.047
		 M12.047,2.047c-5.523,0-10,4.477-10,10c0,5.523,4.477,10,10,10s10-4.477,10-10C22.047,6.524,17.57,2.047,12.047,2.047
		L12.047,2.047z"/>
</g>
</svg>
`

export const ICONS = ['#3E9CFA', '#2D3542', '#78B214', '#D14946', '#EE8D03'].map(
  color => 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(ICON_LOCATION.replace(/{{fillcolor}}/g, color))
)
