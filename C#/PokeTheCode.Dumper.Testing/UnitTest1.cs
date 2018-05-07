using Microsoft.VisualStudio.TestTools.UnitTesting;
using PokeTheCode.Dumper;

namespace PokeTheCode.Dumper.Testing
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            new { A = "OK" }.Dump();
        }
    }
}
