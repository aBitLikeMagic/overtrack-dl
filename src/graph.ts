import * as express from 'express';
import * as fs from 'fs-extra';

//import {OvertrackGame} from './models';
import {HTML} from './html';


export const serveGraph: express.RequestHandler = async (request, response) => {
  const capitalize = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
  const specifiedNames = request.params.name.toLowerCase().split(/\+/g);
  const specifiedName = specifiedNames[0];
  const games: {[index: string]: number[]} = {};
  const labels: {[index: string]: (string|null)[]} = {};

  if (specifiedName === 'magic') {
    // special case my own graph to automatically add all of my accounts and my pre-overtrack data for this season
    if (specifiedNames.length === 1) {
      specifiedNames.push('magoo', 'magma', 'might', 'mogul', 'muggy');
    }
    if (specifiedNames.includes('magic')) games['magic'] = [2169, 2150, 2193, 2232, 2272, 2253, 2238, 2276, 2311, 2292, 2322, 2358, 2390, 2367, 2399, 2434, 2413, 2443, 2469, 2493, 2470, 2495, 2472, 2450];
    if (specifiedNames.includes('might')) games['might'] = [2303, 2286, 2264, 2250, 2236, 2217, 2198, 2234, 2215, 2257, 2296, 2273, 2309, 2290, 2322, 2304, 2328, 2357, 2376, 2404, 2382, 2365, 2343, 2343, 2369, 2394, 2369, 2397, 2376, 2404, 2427, 2399, 2378, 2402, 2434, 2460, 2437, 2415, 2392, 2368, 2345, 2366, 2341, 2365, 2365, 2390, 2371, 2348, 2325, 2305, 2336, 2314, 2335, 2357, 2336, 2363];
    if (specifiedNames.includes('mogul')) games['mogul'] = [2046, 1996, 2054, 2054, 2117, 2163, 2220, 2188, 2225, 2267, 2237, 2268, 2248, 2224, 2204, 2185, 2210, 2189, 2169, 2196, 2176, 2153, 2134, 2164, 2192, 2169, 2151, 2179, 2198, 2223, 2250, 2271, 2296, 2316, 2340, 2313, 2287, 2310, 2337, 2364, 2385, 2363, 2384, 2361, 2340, 2314, 2337, 2312, 2310, 2287, 2312, 2290, 2267, 2289, 2268, 2246, 2220, 2245, 2221, 2199, 2220, 2242, 2222, 2244, 2266, 2245, 2269, 2244, 2272, 2300, 2275, 2251, 2272, 2295, 2318, 2293, 2273, 2251, 2276, 2244, 2221, 2240, 2217, 2241, 2216, 2242, 2267, 2290, 2313, 2292, 2312, 2340, 2340, 2367, 2394, 2418, 2391, 2365, 2343, 2320, 2342, 2368, 2343, 2320, 2343, 2321, 2342, 2322, 2344, 2371];
    if (specifiedNames.includes('magoo')) games['magoo'] = [2546, 2623, 2681, 2636, 2697];

    labels['magic'] = games['magic'].map(_ => null);
    labels['might'] = games['might'].map(_ => null);
    labels['mogul'] = games['mogul'].map(_ => null);
    labels['magoo'] = games['magoo'].map(_ => null);
  }

  const allowedNames = new Set(specifiedNames);

  const datas: any[] = [];
  
  for (const filename of await fs.readdir('games')) {
    const match = filename.match(/^([^\-]+)\-[0-9].+\.json/);
    if (match && allowedNames.has(match[1])) {
      const name = match[1];
      if (!games[name]) games[name] = [];
      if (!labels[name]) labels[name] = [];
      const data = JSON.parse(await fs.readFile('games/' + filename, 'utf8')) as any;
      data['name'] = name;
      datas.push(data);
    }
  }
  
  let previous: any = null;
  // fill missing SR forwards
  // TODO: be more intelligent about this?
  for (const data of datas) {
    if (previous && !data.meta.end_sr) {
      data.meta.end_sr = previous.meta.end_sr + 0.111;
      if (data.meta.result === 'WIN') data.meta.end_sr += 25;
      if (data.meta.loss === 'LOSS') data.meta.end_sr -= 25;
    }
    previous = data;
  }
  let next: any = null;
  // fill missing SR backwards
  for (const data of datas.slice().reverse()) {
    if (next && !data.meta.end_sr) {
      data.meta.end_sr = next.meta.end_sr - 0.111;
      if (next.meta.result === 'WIN') data.meta.end_sr -= 25;
      if (next.meta.loss === 'LOSS') data.meta.end_sr += 25;
    }
    next = data;
  }
  
  
  for (const data of datas) {
    const name = data['name'];
    if (data.meta.end_sr && data.meta.time > 1499482797 && data.meta.time < 1503707707) {
      games[name].push(data.meta.end_sr);
      const pieces = [];
      if (data.meta.end_sr && data.meta.start_sr) {
        const delta = data.meta.end_sr - data.meta.start_sr;
        if (delta < 0) {
          pieces.push(`−${-delta}`);
        } else if (delta > 0) {
          pieces.push(`+${delta}`);
        }
      }
      if (data.meta.result && data.meta.result !== 'UNKNOWN') {
        pieces.push(capitalize(data.meta.result));
      }
      if (data.meta.map && data.meta.map !== 'UNKNOWN') {
        pieces.push('on ' + data.meta.map);
      }
      if (data.meta.heroes_played) {
        pieces.push(`<br>${data.meta.heroes_played.map((x: any) => `${(x[1] * 100)|0}% ${capitalize(x[0])}`).join(', ')}`);
      }
      labels[name].push(pieces.join(' '));
    }
  }

  const names = Object.keys(games).sort();
  const indicies: {[index: string]: number[]} = {};
  const histories: {[index: string]: number[]} = {};
  const markerSizes: {[index: string]: number[]} = {};
  const matchLabels: {[index: string]: (null|string)[]} = {};

  const maxLength = Math.max(...Object.keys(games).map(k => games[k]).map(v => v.length));
  let i;
  for (i = 0; i < maxLength; i++) {
    for (const name of names) {
      if (i === 0) {
        histories[name] = [];
        indicies[name] = [];
        markerSizes[name] = [];
        matchLabels[name] = [];
      }

      if (games[name].length > i) {
        histories[name].push(games[name][i]);
        indicies[name].push(- (i - games[name].length + 1));
        markerSizes[name].push(i == 0 ? 12 : 6);
        matchLabels[name].push(labels[name][i]);
      }
    }
  }

  for (const name of Object.keys(histories)) {
    markerSizes[name][markerSizes[name].length - 1] = 12;
  }

  const plotlyData = names.map(name => {
    return ({
      name: capitalize(name),
      x: indicies[name],
      y: histories[name],
      type: 'scatter',
      mode: 'lines+markers',
      marker: {
        size: markerSizes[name]
      },
      text: matchLabels[name]
    });
  });

  const plotlyLayout = {
    title: `${capitalize(specifiedName)}'s Season 5 in Overwatch`,

    margin: { l: 0, t: 24, b: 34, r: 48 },

    yaxis: {
      title: "Skill Rating",
      side: "right"
    },
    xaxis: {
      title: "Games Ago",
      zeroline: true,
      autorange: 'reversed'
    },
    legend: {
      x: 0.0,
      y: 1.0,
      bordercolor: '#DDD',
      borderwidth: '1'
    }
  };

  response.send(HTML`<!doctype html>
    <title>${capitalize(specifiedName)}'s Season 5 in Overwatch</title>
    <script src="https://cdn.plot.ly/plotly-1.28.3.min.js"></script>
    <style>
      body { position: absolute; top: 0; bottom: 0; left: 0; right: 0; }
      /** plotly uses Open Sans without a fallback, so let's provide some. **/
      @font-face { font-family: 'Open Sans'; src: local("Helvetica"), local("Arial"); }
      </style>
    <body>
    <script data-data="${JSON.stringify(plotlyData)}" data-layout="${JSON.stringify(plotlyLayout)}">'use strict'; ~function() {
      var data = JSON.parse(document.currentScript.dataset.data);
      var layout = JSON.parse(document.currentScript.dataset.layout);

      var renderTimeout = null;

      function render() {
        Plotly.newPlot(document.body, data, layout);
        renderTimeout = null;
      }

      window.addEventListener('resize', function() {
        if (renderTimeout != null) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(render, 100);
      }, false);

      render();
    }();</script>

  `.toString());
};
