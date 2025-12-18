import { Pane } from 'tweakpane';
import { PARAMS } from './params';
import { createHash } from './util';
import { reset_rng, rng } from './random';

export default function (
  reset_board_fn: Function,
  reset_specs_fn: Function,
  reset_pieces_fn: Function,
  redraw_fn: Function
) {
  const pane = new Pane({ title: 'Slant Settings' }); //.on('change', () => redraw_fn());
  const seedPane = pane.addFolder({ title: 'Seed Settings' }); //.on('change', () => reset_board_fn());

  seedPane.addInput(PARAMS, 'master_seed', { label: 'Master seed' }); //.on('change', () => reset_board_fn());

  const master_seed_button = seedPane.addButton({ title: 'Randomize master seed' });
  master_seed_button.on('click', () => {
    randomize_master_seed();
    pane.refresh();
    reset_board_fn();
    redraw_fn();
  });

  const boardPane = pane.addFolder({ title: 'Board' }); //.on('change', () => reset_board_fn());
  boardPane.addInput(PARAMS, 'board_seed', { label: 'Board seed' }); //.on('change', () => reset_board_fn());

  const board_seed_button = boardPane.addButton({ title: 'Randomize board seed' });
  board_seed_button.on('click', () => {
    randomize_board_seed();
    pane.refresh();
    reset_board_fn();
    redraw_fn();
  });

  const specPane = pane.addFolder({ title: 'Specs' }); //.on('change', () => reset_board_fn());
  specPane.addInput(PARAMS, 'spec_seed', { label: 'Spec seed' }); //.on('change', () => reset_specs_fn());

  const spec_seed_button = specPane.addButton({ title: 'Randomize spec seed' });
  spec_seed_button.on('click', () => {
    randomize_spec_seed();
    pane.refresh();
    reset_specs_fn();
    redraw_fn();
  });

  specPane.addInput(PARAMS, 'piece_color_count', {
    label: 'Piece colors',
    step: 1,
    min: 1,
    max: 5,
  });

  specPane.addInput(PARAMS, 'piece_profile_count', {
    label: 'Piece profiles',
    step: 1,
    min: 1,
    max: 10,
  });

  const piecePane = pane.addFolder({ title: 'Pieces' }); //.on('change', () => reset_board_fn());

  piecePane.addInput(PARAMS, 'piece_seed', { label: 'Piece seed' }); //.on('change', () => reset_pieces_fn());

  const piece_seed_button = piecePane.addButton({ title: 'Randomize piece seed' });
  piece_seed_button.on('click', () => {
    randomize_piece_seed();
    pane.refresh();
    reset_pieces_fn();
    redraw_fn();
  });

  const drawPane = pane.addFolder({ title: 'Draw' }); //.on('change', () => reset_board_fn());
  drawPane.addInput(PARAMS, 'palette_id', {
    label: 'Palette id',
    step: 1,
    min: 0,
    max: 15,
  });

  const runPane = pane.addFolder({ title: 'Run' }); //.on('change', () => reset_board_fn());

  const rerun_button = runPane.addButton({ title: 'Run' });
  rerun_button.on('click', () => {
    reset_board_fn();
    redraw_fn();
  });

  // const sunPane = pane.addFolder({ title: 'Sun Settings' });
  // sunPane.addInput(PARAMS, 'sunPosition', {
  //   label: 'Sun position',
  //   picker: 'inline',
  //   x: {
  //     step: 0.2,
  //     min: -2,
  //     max: 2,
  //   },
  //   y: {
  //     step: 0.2,
  //     min: -2,
  //     max: 2,
  //   },
  // });
  // sunPane.addInput(PARAMS, 'mouseControlsSun', { label: 'Mouse controls sun' });

  // sunPane.addInput(PARAMS, 'sunHeight', {
  //   label: 'Sun height',
  //   step: 50,
  //   min: 50,
  //   max: 900,
  // });
  // sunPane.addInput(PARAMS, 'gamma', {
  //   label: 'Gamma',
  //   step: 0.2,
  //   min: -2,
  //   max: 2,
  // });

  // const cellPane = pane.addFolder({ title: 'Cell Settings' });
  // cellPane.addInput(PARAMS, 'zoom', {
  //   label: 'Zoom',
  //   step: 0.1,
  //   min: 0.6,
  //   max: 2.5,
  // });

  // cellPane
  //   .addInput(PARAMS, 'heightRange', {
  //     label: 'Height Range',
  //     step: 1,
  //     min: 0,
  //     max: 20,
  //   })
  //   .on('change', () => resetFn());
  // cellPane
  //   .addInput(PARAMS, 'slopeRange', {
  //     label: 'Slope Range',
  //     step: 0.01,
  //     min: 0,
  //     max: 0.2,
  //   })
  //   .on('change', () => resetFn());

  // const noisePane = pane.addFolder({ title: 'Noise Settings' }).on('change', () => resetFn());
  // noisePane.addInput(PARAMS, 'noiseMagnitude', {
  //   label: 'Noise Magnitude',
  //   step: 0.2,
  //   min: 0,
  //   max: 5,
  // });

  // noisePane.addInput(PARAMS, 'noiseScale', {
  //   label: 'Noise Scale',
  //   step: 0.01,
  //   min: 0.01,
  //   max: 0.1,
  // });

  // const colorPane = pane.addFolder({ title: 'Color Settings' }).on('change', () => resetFn());
  // colorPane.addInput(PARAMS, 'palette1', {
  //   label: 'Main palette',
  //   options: Object.assign({}, ...tome.getNames().map((n) => ({ [n]: n }))),
  // });
  // colorPane.addInput(PARAMS, 'palette1Levels', {
  //   label: 'Levels',
  //   step: 1,
  //   min: 1,
  //   max: 5,
  // });
  // colorPane.addInput(PARAMS, 'palette1Lock', { label: 'Lock' });
  // colorPane.addInput(PARAMS, 'palette2', {
  //   label: 'Secondary palette',
  //   options: Object.assign({}, ...tome.getNames().map((n) => ({ [n]: n }))),
  // });
  // colorPane.addInput(PARAMS, 'palette2Levels', {
  //   label: 'Levels',
  //   step: 1,
  //   min: 1,
  //   max: 5,
  // });
  // colorPane.addInput(PARAMS, 'palette2Lock', { label: 'Lock' });
  // colorPane.addInput(PARAMS, 'palette3', {
  //   label: 'Contrast palette',
  //   options: Object.assign({}, ...tome.getNames().map((n) => ({ [n]: n }))),
  // });
  // colorPane.addInput(PARAMS, 'palette3Levels', {
  //   label: 'Levels',
  //   step: 1,
  //   min: 1,
  //   max: 5,
  // });
  // colorPane.addInput(PARAMS, 'palette3Lock', { label: 'Lock' });

  // const palette_button = colorPane.addButton({ title: 'Randomize Colors' });
  // palette_button.on('click', () => {
  //   randomizePalettes();
  //   pane.refresh();
  // });

  // pane.addInput(PARAMS, 'stroke', { label: 'Outline cells' });
  // pane.addInput(PARAMS, 'rotation', {
  //   label: 'Rotation',
  //   step: 1,
  //   min: -6,
  //   max: 6,
  // });
}

function randomize_master_seed() {
  PARAMS.master_seed = createHash();

  reset_rng(PARAMS.master_seed);

  PARAMS.board_seed = createHash(rng);
  PARAMS.spec_seed = createHash(rng);
  PARAMS.piece_seed = createHash(rng);
}

function randomize_board_seed() {
  PARAMS.board_seed = createHash();
}

function randomize_spec_seed() {
  PARAMS.spec_seed = createHash();
}

function randomize_piece_seed() {
  PARAMS.piece_seed = createHash();
}
