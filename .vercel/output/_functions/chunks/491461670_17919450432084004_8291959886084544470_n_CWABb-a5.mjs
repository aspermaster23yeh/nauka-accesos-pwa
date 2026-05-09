const loginBackground = new Proxy({"src":"/_astro/491461670_17919450432084004_8291959886084544470_n.3SkptAsb.jpg","width":1080,"height":1332,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/aspermaster23/nauka-accesos-pwa/491461670_17919450432084004_8291959886084544470_n.jpg";
							}
							
							return target[name];
						}
					});

export { loginBackground as l };
