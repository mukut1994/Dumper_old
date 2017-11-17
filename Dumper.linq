<Query Kind="Program">
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <NuGetReference>websocket-sharp.clone</NuGetReference>
  <Namespace>Newtonsoft.Json</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>WebSocketSharp</Namespace>
  <Namespace>WebSocketSharp.Server</Namespace>
  <Namespace>Newtonsoft.Json.Serialization</Namespace>
  <Namespace>System.Collections.Concurrent</Namespace>
</Query>

void Main()
{
	while (true)
	{
		//new List<object> { "1", 2, 3 }.ToArray().Dump2();
		//new Dictionary<string, int> { { "asd", 1 }, { "zxc", 2 }}.Dump2();
		
		Action a = () => "OK".Dump();
		a.Dump2("Say OK");
		
		Util.ReadLine();
	}
}

// Define other methods and classes here
public static class Extension
{
	private class Link
	{
		public Guid id = Guid.NewGuid();
		public string Value;
	}
	
	private static WebSocketServer server = new WebSocketServer(port: 1234);
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
			
			
			if(data.StartsWith("Link: ") 
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

	static Extension()
	{
		server.AddWebSocketService<Handler>("/");
		server.Start();
		
		AppDomain.CurrentDomain.ProcessExit += (s, e) => server.Stop();
	}
	
	private static void WaitForConnection()
	{
		waiter.WaitOne();
	}
	
	public static T Dump2<T>(this T target)
	{
		WaitForConnection();
		
		var serialized = JsonConvert.SerializeObject(target, jsonSettings);
		server.WebSocketServices.Broadcast(serialized);
		
		return target;
	}
	
	private static ConcurrentDictionary<Guid, Action> handlers = new ConcurrentDictionary<Guid, Action>();
	public static void Dump2(this Action action, string link)
	{
		var l = new Link { Value = link };
		
		handlers.TryAdd(l.id, action);
		
		l.Dump2();
	}
}