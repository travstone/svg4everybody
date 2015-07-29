/*! svg4everybody v1.0.0 | github.com/jonathantneal/svg4everybody */

function embed(svg, g) {
	if (g) {
		var viewBox = !svg.getAttribute('viewBox') && g.getAttribute('viewBox');
		var fragment = document.createDocumentFragment();
		var clone = g.cloneNode(true);

		if (viewBox) {
			svg.setAttribute('viewBox', viewBox);
		}

		while (clone.childNodes.length) {
			fragment.appendChild(clone.childNodes[0]);
		}

		svg.appendChild(fragment);
	}
}

function loadreadystatechange(xhr) {
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			var x = document.createElement('x');

			x.innerHTML = xhr.responseText;

			xhr.s.splice(0).map(function (array) {
				embed(array[0], x.querySelector('#' + array[1].replace(/(\W)/g, '\\$1')));
			});
		}
	};

	xhr.onreadystatechange();
}

function svg4everybody(opts) {
	opts = typeof opts === 'object' ? opts : {};

	var uses = document.getElementsByTagName('use');
	var script = document.createElement('script');
	var fallbackSrc = 'fallbackSrc' in opts ? opts.fallbackSrc : function (src) {
		return src.replace(/\?[^#]+/, '').replace('#', '.').replace(/^\./, '') + '.png' + (/\?[^#]+/.exec(src) || [''])[0];
	};
	var shim = false;
	var shimExternalContent = 'shimExternalContent' in opts ? opts.shimExternalContent : /\bEdge\/12\b|\bTrident\/[567]\b|\bVersion\/7.0\s+Safari\b/.test(navigator.userAgent) || (navigator.userAgent.match(/AppleWebKit\/(\d+)/) || [])[1] < 537;
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
	var svgCache = {};

	if (LEGACY_SUPPORT && 'shim' in opts) {
		document.createElement('svg');
		document.createElement('use');

		shim = opts.shim;
	}

	function oninterval() {
		var use;

		while (use = uses[0]) {
			var svg = use.parentNode;

			if (svg && /svg/i.test(svg.nodeName)) {
				if (LEGACY_SUPPORT && shim) {
					var img = new Image();
					var width = svg.getAttribute('width');
					var height = svg.getAttribute('height');

					img.src = fallbackSrc(use.getAttribute('xlink:href'), svg);

					if (width) {
						img.setAttribute('width', width);
					}

					if (height) {
						img.setAttribute('height', height);
					}

					svg.replaceChild(img, use);
				} else if (shimExternalContent) {
					var url = use.getAttribute('xlink:href').split('#');
					var url_root = url[0];
					var url_hash = url[1];

					svg.removeChild(use);

					if (url_root.length) {
						var xhr = svgCache[url_root] = svgCache[url_root] || new XMLHttpRequest();

						if (!xhr.s) {
							xhr.s = [];

							xhr.open('GET', url_root);

							xhr.send();
						}

						xhr.s.push([svg, url_hash]);

						loadreadystatechange(xhr);
					} else {
						embed(svg, document.getElementById(url_hash));
					}
				}
			}
		}

		requestAnimationFrame(oninterval, 17);
	}

	if (shimExternalContent) {
		oninterval();
	}
}
