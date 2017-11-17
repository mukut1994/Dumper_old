var Dumper = (function () {
    function Dumper() {
        this.visitors = {};
        this.visitors["undefined"] = this.DefaultVisitor;
        this.visitors["number"] = this.NumberVisitor;
        this.visitors["string"] = this.StringVisitor;
        this.visitors["Link"] = this.LinkVisitor;
        this.visitors["Updateable"] = this.UpdateableVisitor;
    }
    Dumper.prototype.Start = function () {
        var _this = this;
        Dumper.socket = new WebSocket("ws://localhost:1234");
        Dumper.socket.onmessage = function (m) { return _this.OnReceive(m); };
        Dumper.socket.onclose = function (c) { return setTimeout(function () { return _this.Start(); }, 3000); };
    };
    Dumper.prototype.OnReceive = function (message) {
        var x = JSON.parse(message.data);
        var html = this.Visit(x, "root");
        if (html != "")
            html += "<br />";
        document.getElementById("root").innerHTML += html;
        window.scrollTo(0, document.body.scrollHeight);
    };
    Dumper.prototype.Visit = function (obj, name) {
        var type = obj["$type"];
        if (type != undefined)
            type = type.split(",")[0];
        var visitor = this.visitors[type];
        if (typeof (obj) == "number")
            visitor = this.visitors["number"];
        else if (typeof (obj) == "string")
            visitor = this.visitors["string"];
        else if (visitor == undefined)
            visitor = this.visitors["undefined"];
        return visitor(this, obj, name);
    };
    Dumper.prototype.NumberVisitor = function (sender, obj, name) {
        return obj;
    };
    Dumper.prototype.StringVisitor = function (sender, obj, name) {
        return "<span style=\"color:red\">\"" + obj + "\"</span>";
    };
    Dumper.prototype.UpdateableVisitor = function (sender, obj, name) {
        var id = "Updateable_" + obj["id"];
        var element = document.getElementById(id);
        if (element != null) {
            element.innerHTML = sender.Visit(obj["content"], name);
            return "";
        }
        return "<div id=\"" + id + "\">" + sender.Visit(obj["content"], name) + "</div>";
    };
    Dumper.LinkClicked = function (id) {
        Dumper.socket.send("Link: " + id);
    };
    Dumper.prototype.LinkVisitor = function (sender, obj, name) {
        return "<a href=\"javascript:Dumper.LinkClicked('" + obj["id"] + "')\">" + obj["Value"] + "</a>";
    };
    Dumper.prototype.DefaultVisitor = function (sender, obj, name) {
        var list = "";
        for (var member in obj) {
            if (member == "$type")
                continue;
            list += "<li class=\"list-group-item\">" + sender.Visit(obj[member], member) + "</li>";
        }
        var id = "ID" + (Math.random().toString().substring(2, 10));
        var type = obj["$type"] != undefined ? "<span class=\"badge badge-secondary\">" + obj["$type"] + "</span>" : "";
        return "\n        <div class=\"panel-group\">\n        <div class=\"panel panel-default\">\n          <div class=\"panel-heading\">\n            <h4 class=\"panel-title\">\n              <a data-toggle=\"collapse\" href=\"#" + id + "\">" + name + " " + type + "</a>\n            </h4>\n          </div>\n          <div id=\"" + id + "\" class=\"panel-collapse collapse\">\n            <ul class=\"list-group\">\n                " + list + "\n            </ul>\n            <div class=\"panel-footer\"></div>\n          </div>\n        </div>\n      </div>";
    };
    return Dumper;
}());
