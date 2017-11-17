class Dumper
{
    private static socket:WebSocket;
    public visitors: {[id:string]:(sender:Dumper, obj:any, name:string)=>string} = {};

    constructor()
    {
        this.visitors["undefined"] = this.DefaultVisitor;
        this.visitors["number"] = this.NumberVisitor;
        this.visitors["string"] = this.StringVisitor;
        this.visitors["Link"] = this.LinkVisitor;
        this.visitors["Updateable"] = this.UpdateableVisitor;
    }

    public Start()
    {
        Dumper.socket = new WebSocket("ws://localhost:1234");

        Dumper.socket.onmessage = (m) => this.OnReceive(m);
        Dumper.socket.onclose = c => setTimeout(() => this.Start(), 3000);
    }

    public OnReceive(message:MessageEvent)
    {
        var x = JSON.parse(message.data);
        var html = this.Visit(x, "root");

        if(html != "")
            html += "<br />";

        document.getElementById("root").innerHTML += html;

        window.scrollTo(0, document.body.scrollHeight);
    }

    private Visit(obj:any, name:string)
    {
        var type = obj["$type"];

        if(type != undefined)
            type = (type as string).split(",")[0];

        var visitor = this.visitors[type];

        if(typeof(obj) == "number")
            visitor = this.visitors["number"];
        else if(typeof(obj) == "string")
            visitor = this.visitors["string"];

        else if(visitor == undefined)
            visitor = this.visitors["undefined"];

        return visitor(this, obj, name);
    }

    private NumberVisitor(sender:Dumper, obj:any, name:string)
    {
        return obj;
    }

    private StringVisitor(sender:Dumper, obj:any, name:string)
    {
        return `<span style="color:red">"${obj}"</span>`;
    }

    private UpdateableVisitor(sender:Dumper, obj:any, name:string)
    {
        var id = "Updateable_" + obj["id"];
        var element = document.getElementById(id);

        if(element != null)
        {
            element.innerHTML = sender.Visit(obj["content"], name);

            return "";
        }

        return `<div id="${id}">${sender.Visit(obj["content"], name)}</div>`;
    }

    public static LinkClicked(id:any)
    {
        Dumper.socket.send("Link: " + id);
    }

    private LinkVisitor(sender:Dumper, obj:any, name:string)
    {
        return `<a href="javascript:Dumper.LinkClicked('${obj["id"]}')">${obj["Value"]}</a>`;
    }

    private DefaultVisitor(sender:Dumper, obj:any, name:string)
    {
        var list = "";
        for(var member in obj)
        {
            if(member == "$type")
                continue;

            list += `<li class="list-group-item">${sender.Visit(obj[member], member)}</li>`;
        }

        var id = "ID" + (Math.random().toString().substring(2, 10));
        var type = obj["$type"] != undefined ? `<span class="badge badge-secondary">${obj["$type"]}</span>` : "";

        return `
        <div class="panel-group">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h4 class="panel-title">
              <a data-toggle="collapse" href="#${id}">${name} ${type}</a>
            </h4>
          </div>
          <div id="${id}" class="panel-collapse collapse">
            <ul class="list-group">
                ${list}
            </ul>
            <div class="panel-footer"></div>
          </div>
        </div>
      </div>`;
    }
}