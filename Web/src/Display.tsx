import * as React from 'react';
import { Data } from './State';

import './Display.css'

export interface IRender {
  CanRender(Display:Display, object: any): boolean;

  Render(Display:Display, object: any): JSX.Element;
}

export class Display extends React.Component<Data & { OnClose: { (): void } }, {}> {

  render() {

    let data = JSON.parse(this.props.data);

    return BestRenderer(data).Render(this, data);
  }
}

class ObjectRender implements IRender {
  CanRender(object: any): boolean {
    return true;
  }

  Render(Display: Display, object: any): JSX.Element {

    let display: JSX.Element[] = [];

    for (let prop in object) {
      if (prop === '$type') {
        continue;
      }
      
      let content = BestRenderer(object[prop]).Render(Display, object[prop]);
      display.push(<tr><td>{prop}</td><td>{content}</td></tr>);
    }

    return (
      <div className="content">
        <div className="header">
          {object['$type'].split(',')[0]} <button onClick={Display.props.OnClose} className="close">X</button>
        </div>
        <div>
        <table>{display}</table>
        </div>
      </div>
    );
  }

}

class PrimitiveRenderer implements IRender {
  CanRender(object: any): boolean {
    return typeof (object) === 'string' || typeof (object) === 'number';
  }

  Render(Display: Display, object: any): JSX.Element {
    if (typeof (object) === 'string') {
      return <div className='string'>"{object}"</div>;
    }
    else if (typeof (object) === 'number') {
      return <div className='number'>{object}</div>;
    }
    else {
      throw new Error('Method not implemented.');
    }
  }

}

class ListRenderer implements IRender {
  CanRender(object: any): boolean {
    return false;
  }
  
  Render(Display: Display, object: any): JSX.Element {
    throw new Error('Method not implemented.');
  }

}

let renderers = [
  new ListRenderer(),
  new PrimitiveRenderer(),
  new ObjectRender()
];

function BestRenderer(o: any) {

  for (let i = 0; i < renderers.length; i++) {
    if (renderers[i].CanRender(o)) {
      return renderers[i];
    }
  }

  throw new Error('Method not implemented.')
}