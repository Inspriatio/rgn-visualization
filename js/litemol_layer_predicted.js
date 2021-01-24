/**
 * Created by xuyang on 2020/3/13.
 */
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var SimpleControllerExample;
    let proteinId = document.cookie.split(";")[0];
    (function (SimpleControllerExample) {
        //创建插件
        var plugin = LiteMol.Plugin.create({
            target: '#app',
            viewportBackground: '#fff',
            layoutState: {
                hideControls: true,
                isExpanded: true
            },
            allowAnalytics: true
        });
        //加载分子
        plugin.loadMolecule({
            format: 'cif',
            url: "./data/file/"+proteinId+"/"+proteinId+"_Predicted.cif",
        }).then(function () {
            console.log('Molecule loaded');
        }).catch(function (e) {
            console.error(e);
        });
    })(SimpleControllerExample = LiteMol.SimpleControllerExample || (LiteMol.SimpleControllerExample = {}));
})(LiteMol || (LiteMol = {}));
