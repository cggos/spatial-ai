---
layout: article
title:  "Ubuntu 下安装 Apache+PHP+MySQL"
tags: WebDev PHP
key: php-apache-mysql-install
---

# Apache

1、安装apache2：

```sh
sudo apt-get install apache2
```

2、重启apache2：

```sh
sudo /etc/init.d/apache2 restart
```

3、在浏览器里输入http://localhost或者是http://127.0.0.1，如果看到了

![](../images/web/php_apache_mysql_01.jpg)


那就说明Apache成功安装了。

Apache的默认安装，会在/var下建立一个名为www的Web目录，所有要能通过浏览器访问的Web文件都要放到这个目录里。

4、若要关闭apache2，执行如下命令：

```sh
sudo service apache2 stop
```

# PHP

1、安装php（建议安装扩展php5-gd php5-mysql）:

```sh
sudo apt-get install libapache2-mod-php5 php5
```

2、重启apache2，让它加载PHP模块：

```sh
sudo /etc/init.d/apache2 restart
```

3、PHP网络服务器根目录默认设置是在：/var/www。由于Linux系统的安全性原则，该目录下的文件读写权限是只允许root用户操作的，所以我们不能在www文件夹中新建php文件，也不能修改和删除，必须先修改/var/www目录的读写权限。在界面管理器中通过右键属性不能修改文件权限，得执行root终端命令：

```sh
sudo chmod 777 /var/www
``

然后就可以写入html或php文件了。

4、在Web目录下面新建一个test.php文件来测试PHP是否能正常的运行：

```sh
sudo gedit /var/www/test.php
```

然后输入:

```php
<?php echo "hello,world!!"; ?>
<?php phpinfo(); ?>
```

保存文件,在浏览器里输入http://127.0.0.1/test.php，如果看到”hello,world!!“和php的信息，如下图所示：

![](../images/web/php_apache_mysql_02.jpg)


在网页中显示那就说明PHP已经正常运行了。

5、如果输出汉字时在网页中出现乱码，则在/etc/apache2/apache2.conf 文件尾加入如下代码：

```
AddDefaultCharset UTF-8
```

保存后重启Apache2，再刷新网页，中文即可正常显示。


# MySQL

1、安装mysql数据库（apt-get程序会自动下载安装最新的mysql版本）:

```sh
sudo apt-get install mysql-server mysql-client
```

在安装的最后，输入root的密码（这里的root密码不是Ubuntu的root密码，是你要给MySQL设定的root密码）。

注：MySQL的配置文件在/etc/mysql目录。

为了避免中文可能带来的乱码问题，将默认字符集改成utf-8，修改 /etc/mysql/my.cnf 文件，在相应位置添加：

```ini
[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
collation-server = utf8_unicode_ci
init-connect='SET NAMES utf8'
character-set-server = utf8
```

2、在 /var/www 目录下新建 testmysql.php 文件，测试php连接MySQL，文件内容如下：

```php
<?php
    $link = mysql_connect("localhost", "用户名", "密码");
    if (!$link)
    {
            die('Could not connect: '.mysql_error());
    }
    else echo "MySQL连接成功";
    mysql_close($link);
?>
```

再浏览器访问testmysql.php，若链接成功即可显示"MySQL连接成功"。

3、安装phpmyadmin-Mysql数据库管理

```sh
sudo apt-get install phpmyadmin
```

在安装过程中会要求选择Web server：apache2或lighttpd，如下图所示：

![](../images/web/php_apache_mysql_03.jpg)


使用空格键选定apache2，按tab键，然后enter；

然后会要求输入设置的Mysql数据库密码 ：

![](../images/web/php_apache_mysql_04.jpg)

再设置phpmyadmin注册数据库的密码：

![](../images/web/php_apache_mysql_05.jpg)

然后将phpmyadmin与apache2建立符号连接，因www目录在/var/www，phpmyadmin在/usr/share/phpmyadmin目录，所以：

```sh
sudo ln -s /usr/share/phpmyadmin /var/www
```

最后phpmyadmin测试：打开http://localhost/phpmyadmin，就可看到phpMyAdmin的登陆界面，如下图所示：

![](../images/web/php_apache_mysql_06.jpg)


也可参考网站： http://wiki.ubuntu.org.cn/Apache
​
