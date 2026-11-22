import { CitadelWindows } from './RickDimensionExperience';

export default function DimensionalScene({ secret = false }) {
  return <div className="dimensional-scene" aria-hidden="true">
    <div className="dimension-starfield" />
    {secret ? <><img className="citadel-city-art" src="/rick-assets/citadel-plaza.png" alt="" /><div className="citadel-city-shade" /><CitadelWindows /></> : <div className="garage-wall-art" /> }
    <div className="alien-planet"><i /><b /></div>
    <svg className="alien-horizon" viewBox="0 0 1600 700" preserveAspectRatio="none" focusable="false">
      <path className="alien-ridge-far" d="M0 500 70 455 110 475 190 340 245 430 300 400 420 505 530 480 670 530 790 470 890 525 1020 430 1070 460 1160 310 1220 425 1300 385 1380 470 1450 390 1600 490V700H0Z" />
      <path className="alien-ridge-near" d="M0 590Q150 510 310 590T650 590T990 590T1320 560T1600 580V700H0Z" />
      <g className="alien-plants" fill="none" strokeLinecap="round">
        <path d="M70 590q15-90-5-130m5 75q-40-20-35-52m35 25q40-5 37-45M1510 585q-16-100 15-163m-19 105q-45-12-40-48m45 10q48 0 40-45" />
        <path d="M135 600q-10-45 8-75m1315 83q15-50-3-75" />
      </g>
    </svg>
  </div>;
}
