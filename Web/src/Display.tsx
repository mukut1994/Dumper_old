import * as React from 'react';
import { Data } from './State';

import './Display.css'

export class Display extends React.Component<Data & { OnClose?:{():void } }, {}> {

  render() {
    return (
      <div className="header">
        TypeName: <a href={void{}} className="close">X</a>
      </div>
    );
  }
}