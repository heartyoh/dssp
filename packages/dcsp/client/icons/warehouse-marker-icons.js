const ICON_WAREHOUSE_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
<style type="text/css">
	.st0{opacity:0.15;enable-background:new    ;}
	.st1{fill:#FFFFFF;}
	.st2{fill:#D56761;}
	.st3{fill:#D56761;stroke:#D56761;stroke-width:0.5;stroke-miterlimit:10;}
	.st4{fill:#D56761;stroke:#D56761;stroke-width:0.25;stroke-miterlimit:10;}
</style>
<g id="Layer_2_1_">
	<path class="st0" d="M14.4,1.3c-5.1-0.5-9.6,3-10.1,8s3.1,8.9,7.8,14c5.6-3.9,10-7,10.6-12C23.1,6.4,19.4,1.9,14.4,1.3z"/>
	<ellipse class="st1" cx="12" cy="10.3" rx="8.5" ry="8.5"/>
</g>
<g id="Layer_1_1_">
	<path class="st2" d="M12,0.9c-5.1,0-9.2,4-9.2,9c0,5.1,4,8.5,9.2,13.1c5.2-4.5,9.2-8,9.2-13.1C21.2,4.9,17.1,0.9,12,0.9z M12,18
		c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S16.4,18,12,18z"/>
	<g>
		<polygon class="st3" points="6.5,7.2 6.5,13 12.5,15.9 12.5,10.4 17,8.1 17,12.9 17.8,13.2 17.8,13.2 17.8,6.9 11.7,9.9 
			11.7,14.7 7.3,12.5 7.3,7.7 13.1,4.6 13.1,4.6 12.3,4.1 		"/>
		<polygon class="st4" points="15.7,5.7 14.8,5.3 9,8.5 9,10.1 9.8,10.5 9.8,8.9 		"/>
	</g>
	<polygon class="st1" points="18.2,6.6 10.6,3.6 14.6,3.4 	"/>
</g>
</svg>
`
const FOCUS_ICON_WAREHOUSE_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
<style type="text/css">
	.st0{opacity:0.15;enable-background:new    ;}
	.st1{fill:#D56761;}
	.st2{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
	.st3{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:0.25;stroke-miterlimit:10;}
</style>
<path class="st0" d="M14.4,1.3c-5.1-0.5-9.6,3-10.1,8s3.1,8.9,7.8,14c5.6-3.9,10-7,10.6-12C23.1,6.4,19.4,1.9,14.4,1.3z"/>
<path class="st1" d="M12,0.9c-5.1,0-9.2,4-9.2,9c0,5.1,4,8.5,9.2,13.1c5.2-4.5,9.2-8,9.2-13.1C21.2,5,17.1,0.9,12,0.9z"/>
<g>
	<g>
		<polygon class="st2" points="6.6,7 6.6,12.8 12.6,15.7 12.6,10.2 17.1,7.9 17.1,12.7 17.9,13 17.9,13 17.9,6.7 11.8,9.7 
			11.8,14.5 7.4,12.3 7.4,7.5 13.2,4.4 13.2,4.4 12.4,3.9 		"/>
		<polygon class="st3" points="15.8,5.5 14.9,5.1 9.1,8.3 9.1,9.9 9.9,10.3 9.9,8.7 		"/>
	</g>
	<polygon class="st1" points="18.3,6.4 10.7,3.5 14.7,3.2 	"/>
</g>
</svg>
`

export const WAREHOUSE_ICONS = ['black', 'red', 'blue', 'yellow', 'orange', 'tomato'].map(
  color => 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(ICON_WAREHOUSE_TEMPLATE.replace(/{{fillcolor}}/g, color))
)

export const FOCUS_WAREHOUSE_ICON =
  'data:image/svg+xml;charset=UTF-8;base64,' + btoa(FOCUS_ICON_WAREHOUSE_TEMPLATE.replace(/{{fillcolor}}/g, 'brown'))
