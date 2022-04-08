---
layout: article
title:  "C# 配置文件操作"
tags: CSharp
key: csharp-config-file
---

# Overview
​
配置文件的格式主要有ini、xml、cfg、config等，现在对这些格式的配置文件的操作（C#）进行简单说明。

# INI配置文件操作

调用系统函数 `GetPrivateProfileString()` 和 `WritePrivateProfileString()` 等

（1）导入库

```csharp
[DllImport("kernel32")]
private static extern long WritePrivateProfileString(string section, string key, string val, string filePath);
[DllImport("kernel32")]
private static extern int GetPrivateProfileString(string section, string key, string def, StringBuilder retVal, int size, string filePath);
```

（2）调用函数读写ini配置文件

```csharp
//读
StringBuilder strCom = new StringBuilder(255);
GetPrivateProfileString("串口参数", "端口", "", strCom, 255, "Setting.ini");

//写
WritePrivateProfileString("串口参数", "端口", "COM3", "Setting.ini");
```

# CFG配置文件操作

配置文件操作组件SharpConfig 是 .NET 的 CFG/INI 配置文件操作组件。

配置文件示例（sample.cfg）：

```csharp
[General]
# a comment
SomeString = Hello World!
SomeInteger = 10 # an inline comment
SomeFloat = 20.05
ABoolean = true
```

C#代码示例：

```csharp
Configuration config = Configuration.LoadFromFile( "sample.cfg" );
Section section = config["General"];
string someString = section["SomeString"].Value;
int someInteger = section["SomeInteger"].GetValue<int>();
float someFloat = section["SomeFloat"].GetValue<float>();
```

上述SharpConfig参考SharpConfig首页、文档和下载 - 配置文件操作组件 - OSCHINA - 中文开源技术交流社区。

# config配置文件操作

AppUser.config文件内容如下：

```csharp
<?xml version="1.0" encoding="utf-8" ?>
<configuration>

  <appSettings>
    <add key="SvrName" value="127.0.0.1"></add>
    <add key="DBName" value="WarehouseDB"></add>
    <add key="UsrName" value="sa"></add>
    <add key="PassWord" value="sa"></add>
  </appSettings>

  <!--连接数据库字符串-->
  <connectionStrings>
    <add name="DBConnString" connectionString="server=GAOHONGCHEN\SQLEXPRESS;database=egdb;uid=sa;pwd=123456"/>
  </connectionStrings>

</configuration>
```

C#读取AppUser.config文件的DBConnString的核心代码如下：

```csharp
ExeConfigurationFileMap CfgFileMap = new ExeConfigurationFileMap();
CfgFileMap.ExeConfigFilename = AppUserCfgPath;
Configuration CfgFile = ConfigurationManager.OpenMappedExeConfiguration(CfgFileMap, ConfigurationUserLevel.None);

strConnDB = CfgFile.ConnectionStrings.ConnectionStrings["DBConnString"].ConnectionString;
```

config配置文件的详细操作请参考以下链接：

* Read/Write App.Config File with .NET 2.0：Read/Write App.Config File with .NET 2.0 - CodeProject
* C#读写app.config中的数据：C#读写app.config中的数据 - Cad人生 - 博客园
* C#读写config配置文件：C#读写config配置文件 - 阿凡卢 - 博客园

# XML配置文件操作

XML配置文件的一般操作请参见我的另一篇博客：

XML文件操作（C#）：XML文件操作（C#） - 晨光iABC - 博客园

