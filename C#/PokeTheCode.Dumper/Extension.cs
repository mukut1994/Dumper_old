using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace PokeTheCode.Dumper
{
    public static class DumperExtension
    {
        private class Link
        {
            public Guid id = Guid.NewGuid();
            public string Value;
        }

        private static WebSocketServer server = new WebSocketServer(port: 3020);
        private static ManualResetEvent waiter = new ManualResetEvent(false);
        private static JsonSerializerSettings jsonSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.All,
            TypeNameAssemblyFormatHandling = TypeNameAssemblyFormatHandling.Simple,
            SerializationBinder = new TypeConv()
        };

        private class Handler : WebSocketBehavior
        {
            protected override Task OnOpen()
            {
                waiter.Set();

                return Task.CompletedTask;
            }

            protected override Task OnMessage(MessageEventArgs e)
            {
                var data = e.Text.ReadToEnd();


                if (data.StartsWith("Link: ")
                    && Guid.TryParse(data.Split(':')[1], out var id)
                    && handlers.TryGetValue(id, out var action))
                    action();

                return Task.CompletedTask;
            }
        }

        private class TypeConv : DefaultSerializationBinder
        {
            public override void BindToName(Type serializedType, out string assemblyName, out string typeName)
            {
                base.BindToName(serializedType, out assemblyName, out typeName);

                typeName = serializedType.Name;
            }
        }

        static DumperExtension()
        {
            server.AddWebSocketService<Handler>("/");
            server.Start();

            AppDomain.CurrentDomain.ProcessExit += (s, e) => server.Stop();
        }

        private static void WaitForConnection()
        {
            waiter.WaitOne();
        }

        public static T Dump<T>(this T target)
        {
            WaitForConnection();

            var serialized = JsonConvert.SerializeObject(target, jsonSettings);
            server.WebSocketServices.Broadcast(serialized);

            return target;
        }

        // TODO just use the serializer to visit it
        private static ConcurrentDictionary<Guid, Action> handlers = new ConcurrentDictionary<Guid, Action>();
        public static void Dump(this Action action, string link)
        {
            var l = new Link { Value = link };

            handlers.TryAdd(l.id, action);

            l.Dump();
        }
    }
}