const ICON_MONITORING = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
	 	<polygon style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="56.7,37.1 20,26.5 20,112.9 56.7,123.5"/>
	 	<polygon style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="93.3,112.9 56.7,123.5 56.7,37.1 93.3,26.5"/>
	 	<polygon style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="130,35.1 93.3,26.5 93.3,112.9 130,121.5"/>
 	 </g>
</svg>
`

const ICON_REPORT = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<g>
			<rect x="73.2" y="103.2" style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" width="9.1" height="20.6"/>
			<rect x="88.7" y="88.8" style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" width="9.1" height="35"/>
			<rect x="104.1" y="73.8" style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" width="9.1" height="50"/>
		</g>
		<g>
			<g>
				<g>
					<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M69,121.2H40.8c-1.1,0-2-0.9-2-2v-91c0-1.1,0.9-2,2-2h45.6"/>
				</g>
				<g>
					<line style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="109.9" y1="50.3" x2="109.9" y2="68.8"/>
				</g>
				<polyline style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="109.9,50.3 86.4,50.3 86.4,26.8 				"/>
				<line style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="86.4" y1="26.2" x2="109.9" y2="50.3"/>
			</g>
		</g>
	</g>
</svg>
`

const ICON_FLEET = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-miterlimit:10;" d="M108.5,69.1c0,1.8,1.5,3.3,3.4,3.3h1.4c1.9,0,3.4-1.5,3.4-3.3v-7.4c0-1.8-1.5-3.3-3.3-3.3h-1.4
		c-1.9,0-3.4,1.5-3.4,3.3 M41.4,69l-4.1,11.3V110c0,1.8,1.5,3.3,3.4,3.3h2.4v3.9c0,2.9,1.4,5.2,4.4,5.2h4.9c3,0,4.4-2.3,4.4-5.2
		v-3.9h36.5v3.9c0,2.9,1.4,5.2,4.4,5.2h4.9c3,0,4.4-2.3,4.4-5.2v-3.9h2.4c1.8,0,3.4-1.5,3.4-3.3l-1-29.7L108.6,69 M41.5,61.8
		c0-1.8-1.5-3.3-3.4-3.3h-1.4c-1.9,0-3.3,1.5-3.3,3.3v7.4c0,1.8,1.5,3.3,3.3,3.3h1.4c1.9,0,3.4-1.5,3.4-3.3 M108.5,61.6l-1-31.5
		c-0.3-1.5-1.7-2.6-3.3-2.6H46.8c-1.6,0-2.9,1.1-3.3,2.6l-2,31.6 M50.7,99.9c-2.5,0-4.5-2-4.5-4.4s2-4.4,4.5-4.4
		c2.5,0,4.5,2,4.5,4.4C55.2,98,53.2,99.9,50.7,99.9z M98.4,99.9c-2.5,0-4.5-2-4.5-4.4s2-4.4,4.5-4.4c2.5,0,4.5,2,4.5,4.4
		C102.9,98,100.8,99.9,98.4,99.9z M62.5,93.9h25 M48.2,53.4h53.4 M62.5,98.2h25 M62.5,102.5h25 M75,82.4c-12.4,0-17.5-0.6-27.9-3.5
		L50.2,62l5.5-0.8h38.7l5.5,0.8l3.1,16.8C92.5,81.8,87.4,82.4,75,82.4z"/>
	</g>
</svg>
`

const ICON_DRIVER = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" d="M102,119.5c-2.7-12.9-13.8-20.6-27-20.6c-13.1,0-23.6,7.8-27,20.6"/>
		<path id="user-5" style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" d="M97.2,49.7c0,12.3-9.9,22.2-22.2,22.2c-12.3,0-22.2-9.9-22.2-22.2c0-12.3,9.9-22.2,22.2-22.2
			C87.3,27.5,97.2,37.4,97.2,49.7z"/>
		<path id="user-5_1_" style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" d="M35.3,113.5C35.3,96,53.1,72.3,75,72.3c21.9,0,39.7,23.7,39.7,41.2"/>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" x1="100.9" y1="84.2" x2="79.8" y2="99.3"/>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" x1="100.1" y1="113.9" x2="87.9" y2="122.5"/>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" x1="51" y1="114.1" x2="59.5" y2="121.8"/>
	</g>
</svg>
`

const ICON_GEOFENCE = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-miterlimit:10;" d="M121.9,84.7L86.2,65.1c-0.4,0.8-1.2,1.4-2.2,1.4c-1.3,0-2.4-1.1-2.4-2.4c0-1.3,1.1-2.4,2.4-2.4
			c0.3,0,0.5,0.1,0.7,0.1l5.9-23c-0.5-0.2-0.8-0.6-1.1-1.1l-42,11.7c0.1,0.3,0.2,0.5,0.2,0.8c0,1.3-1.1,2.4-2.4,2.4
			c-0.4,0-0.8-0.1-1.1-0.3L26.8,92.9c0.8,0.4,1.3,1.2,1.3,2.2c0,0.3-0.1,0.6-0.2,0.9l38.9,16.6c0.3-0.9,1.2-1.6,2.3-1.6
			c1,0,1.9,0.6,2.2,1.5L122,86c-0.1-0.3-0.2-0.6-0.2-1C121.8,84.9,121.8,84.8,121.9,84.7z"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-miterlimit:10;" d="M90.6,38.8c0.3,0.2,0.7,0.3,1.1,0.3c1.3,0,2.4-1.1,2.4-2.4c0-1.3-1.1-2.4-2.4-2.4c-1.3,0-2.4,1.1-2.4,2.4
			c0,0.4,0.1,0.8,0.3,1.1"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M89.6,37.8c0.2,0.5,0.6,0.8,1.1,1.1"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M26.8,92.9c-0.3-0.2-0.7-0.3-1.1-0.3c-1.3,0-2.4,1.1-2.4,2.4s1.1,2.4,2.4,2.4c1,0,1.9-0.7,2.3-1.6"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M47.6,49.4c-0.3-0.9-1.2-1.6-2.3-1.6c-1.3,0-2.4,1.1-2.4,2.4c0,0.9,0.5,1.7,1.3,2.2"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M122,86c0.4,0.9,1.2,1.5,2.2,1.5c1.3,0,2.4-1.1,2.4-2.4s-1.1-2.4-2.4-2.4c-1.2,0-2.2,0.9-2.4,2.1"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M86.2,65.1c0.1-0.3,0.2-0.6,0.2-1c0-1.1-0.7-2-1.7-2.3"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" d="M66.9,112.5c-0.1,0.3-0.1,0.5-0.1,0.8c0,1.3,1.1,2.4,2.4,2.4c1.3,0,2.4-1.1,2.4-2.4c0-0.3-0.1-0.6-0.2-0.9"/>
	</g>
</svg>
`

const ICON_ADMINISTRATOR = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<g>
			<path style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M125,101.5c0,1.1-0.9,2-2,2H27c-1.1,0-2-0.9-2-2V33.6c0-1.1,0.9-2,2-2h96c1.1,0,2,0.9,2,2V101.5z"/>
		</g>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="55.1" y1="118.4" x2="94.9" y2="118.4"/>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="75" y1="103.5" x2="75" y2="118.4"/>
	</g>
	<g>
		<g>
			<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M87.8,70.3l4.7,2.8l-1.8,4.3l-5.3-1.3c-0.8,1-1.7,1.9-2.8,2.7L84,84l-4.3,1.8l-2.8-4.7
				c-0.6,0.1-1.2,0.1-1.8,0.1c-0.7,0-1.3-0.1-2-0.2h0l-2.8,4.7L65.9,84l1.3-5.3c-1-0.8-2-1.7-2.7-2.8l-5.2,1.4l-1.8-4.3l4.7-2.8
				c-0.1-0.6-0.1-1.2-0.1-1.8c0-0.7,0.1-1.4,0.2-2.1v0l-4.7-2.7l1.8-4.3l5.2,1.4c0.8-1.1,1.7-2,2.8-2.8L66,52.6l4.3-1.8l2.8,4.7
				c0.6-0.1,1.2-0.1,1.9-0.1c0.7,0,1.3,0.1,2,0.2l2.8-4.7l4.3,1.8l-1.4,5.3c1.1,0.8,2,1.7,2.8,2.8l5.3-1.4l1.8,4.3l-4.7,2.8
				c0.1,0.6,0.1,1.2,0.1,1.8C87.9,69,87.9,69.7,87.8,70.3z"/>
		</g>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M71.2,72.1c2.1,2.1,5.5,2.1,7.5,0c2.1-2.1,2.1-5.5,0-7.5c-2.1-2.1-5.5-2.1-7.5,0C69.2,66.6,69.2,70,71.2,72.1
			z"/>
	</g>
</svg>
`

const ICON_CLIENT = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M86.7,108.5l10.9-6.7c-3.5-1.7-5.9-5.2-6-9.3L91.2,84c0-4.2,2.6-7.8,6.4-9.3V54.8v-23h-58v85.9h30.9h13.1
			v-4.3C83.6,111.3,84.8,109.4,86.7,108.5z M84.6,43.4l-0.1,22.5L84.6,43.4z M52.9,65.9L53,43.4L52.9,65.9z M63.5,65.9l0.1-22.5
			L63.5,65.9z M74,65.9l0.1-22.5L74,65.9z M84.6,77.8l-0.1,23.5L84.6,77.8z M52.9,101.3L53,77.8L52.9,101.3z M63.5,101.3l0.1-23.5
			L63.5,101.3z M74,101.3l0.1-23.5L74,101.3z"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M86.7,108.5c-1.9,0.9-3.1,2.8-3.1,4.9v4.3"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M91.2,84l0.3,8.5"/>
		<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M82.8,117.7h39v-4.3c0-2.1-1.2-4-3.1-4.9l-10.9-6.7c3.5-1.7,5.9-5.2,6-9.3l0.3-8.5c0-5.6-4.6-10.1-10.2-10.1
			h-5.3"/>
	</g>
</svg>
`

const ICON_DEVICE = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 150 150" style="enable-background:new 0 0 150 150;" xml:space="preserve">
	 <g>
		<g>
			<path style="fill:none;stroke:{{strokecolor}};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M110.6,120c0,1.1-0.9,2-2,2H40c-1.1,0-2-0.9-2-2V29c0-1.1,0.9-2,2-2h68.6c1.1,0,2,0.9,2,2V120z"/>
		</g>
		<g>
			<g>
				<g>
					<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M84.2,66.7c-4.9-5.1-12.8-5.1-17.8,0"/>
					<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M90.5,60.1c-8.4-8.7-22-8.7-30.4,0"/>
					<path style="fill:none;stroke:{{strokecolor}};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M96.8,53.5c-11.9-12.4-31.1-12.4-43,0"/>
				</g>
				<g>
					<path style="fill:{{strokecolor}};" d="M75.3,71.7C69.1,71.7,64,77,64,83.5c0,6.5,11.4,20.7,11.4,20.7s11.4-14.1,11.4-20.7
						C86.7,77,81.6,71.7,75.3,71.7z M75.3,89.1c-2.9,0-5.3-2.5-5.3-5.6c0-3.1,2.4-5.6,5.3-5.6s5.3,2.5,5.3,5.6
						C80.7,86.6,78.3,89.1,75.3,89.1z"/>
				</g>
			</g>
		</g>
		<line style="fill:none;stroke:{{strokecolor}};stroke-width:9;stroke-miterlimit:10;" x1="113.2" y1="40" x2="113.2" y2="53.3"/>
	</g>
</svg>
`

function icons(template) {
  return ['#ffffff', '#64A3D9'].map(
    color => 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(template.replace(/{{strokecolor}}/g, color))
  )
}

export const ICONS_MONITORING = icons(ICON_MONITORING)
export const ICONS_REPORT = icons(ICON_REPORT)
export const ICONS_FLEET = icons(ICON_FLEET)
export const ICONS_DEVICE = icons(ICON_DEVICE)
export const ICONS_CLIENT = icons(ICON_CLIENT)
export const ICONS_DRIVER = icons(ICON_DRIVER)
export const ICONS_GEOFENCE = icons(ICON_GEOFENCE)
export const ICONS_ADMINISTRATOR = icons(ICON_ADMINISTRATOR)
