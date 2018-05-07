import * as React from 'react';
import { Data, State } from './State';

import './Display.css';

export interface Renderer {
  CanRender(Display: Display, object: any): boolean;

  Render(displayContext: DisplayContext, object: any): JSX.Element;
}

class DisplayContext {
  public Data: Data;
  public State: State;
  public OnClose?: { (): void };
}

export class Display extends React.Component<DisplayContext, {}> {

  render() {
    let data = JSON.parse(this.props.Data.data);

    return BestRenderer(data).Render(this.props, data);
  }
}

class ObjectRender implements Renderer {
  CanRender(object: any): boolean {
    return true;
  }

  Render(displayContext: DisplayContext, object: any): JSX.Element {

    let display: JSX.Element[] = [];

    for (let prop in object) {
      if (prop === '$type') {
        continue;
      }

      let content = BestRenderer(object[prop]).Render(displayContext, object[prop]);
      display.push(<tr key={Math.random()}><td>{prop}</td><td>{content}</td></tr>);
    }

    let header = Type(object);
    let subHeader = Namespace(object);

    return (
      <div className="content">
        <div className="header">
          {header}
          <span className="subheader">{subHeader}</span>
          <button onClick={displayContext.OnClose} className="close">X</button>
        </div>
        <div>
          <table>
            <tbody>
              {display}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

class PrimitiveRenderer implements Renderer {
  CanRender(object: any): boolean {
    return typeof (object) === 'string' || typeof (object) === 'number';
  }

  Render(displayContext: DisplayContext, object: any): JSX.Element {
    if (typeof (object) === 'string') {
      return <div className="string">"{object}"</div>;
    } else if (typeof (object) === 'number') {
      return <div className="number">{object}</div>;
    } else {
      throw new Error('Method not implemented.');
    }
  }

}

class LinkRenderer implements Renderer {
  CanRender(object: any): boolean {
    return IsType(object, 'link');
  }
  Render(displayContext: DisplayContext, object: any): JSX.Element {
    return <a href="#" onClick={() => this.OnClick(displayContext, object['id'])}>{object['Value']}</a>;
  }

  private OnClick(displayContext: DisplayContext, id: string) {
    displayContext.State.client.send(id);
  }
}

class ListRenderer implements Renderer {
  CanRender(object: any): boolean {
    return false;
  }

  Render(displayContext: DisplayContext, object: any): JSX.Element {
    throw new Error('Method not implemented.');
  }

}

let renderers = [
  new LinkRenderer(),
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

  throw new Error('Method not implemented.');
}

function IsType(object: {}, type: string) {
  return Type(object) === type;
}

function Type(object: {}) {
  if (object['$type'] === undefined) {
    return typeof (object);
  }

  let split = object['$type'].split(',');

  return split[0];
}

function Namespace(object: {}) {
  if (object['$type'] === undefined) {
    return '';
  }

  let split = object['$type'].split(',');

  return split.length > 1 ? split[1] : '';
}