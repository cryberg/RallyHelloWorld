Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.update("Hello World Bla bla");
        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    }
});
