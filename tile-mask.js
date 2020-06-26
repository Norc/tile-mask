'use strict';
class TileMaskLayer extends PlaceablesLayer {
  constructor() {
    super();

    this._controlled = {};
    this.visible =true;
    

 }

  static get layerOptions() {
    return mergeObject(super.layerOptions, {
      canDragCreate: false,
      objectClass: Note,
      sheetClass: NoteConfig
    });
  }   
}

Hooks.once("canvasInit", (canvas) => {
canvas.tilemaskeffect = canvas.stage.addChildAt(new TileMaskLayer(canvas), 8);
});

class Tilemask {
    
    static addTokenMaskButton(scene, object, updateData) {
        object.find('.col.left').append(
            '<div class="control-icon activate-mask">\
            <img src="modules/tile-mask/images/mask.svg" width="36" height="36" title="Toggle Mask"></div>', 
            '<div class="control-icon activate-inversemask">\
            <img src="modules/tile-mask/images/inversemask.svg" width="36" height="36" title="Toggle Inverse Mask"></div>', 
            '<div class="control-icon radiusTool"><input id="myInputRadius" type="text" value="2" maxlength ="2" title="Circle Size"></div>',
            '<div class="control-icon blurTool"><input id="myInputBlur" type="text"  value="2" maxlength ="2" title="Blur Size"></div>'
           
    );
    }
   
    static maskButton(scene, object, updateData) {
         
        let Tile = canvas.tiles.get(updateData["_id"]); 
        

        function inputSize (){
            var blurSize = Math.floor(document.getElementById("myInputBlur").value);
            var radius = Math.floor(document.getElementById("myInputRadius").value);
            var myArr = [radius, blurSize];
            return myArr;
        }
      
        document.getElementById("myInputRadius").onchange = function() {myFunction()};
        document.getElementById("myInputBlur").onchange = function() {myFunction()};
      
            function myFunction() {

            var inputValues = inputSize();
            console.log(inputValues);
                Tile.setFlag("tile-mask", "radius", inputValues[0]);
                Tile.setFlag("tile-mask", "blur", inputValues[1]);
              
                
                           if ( Tile.getFlag("tile-mask","normalmask")=== true)
            {
                Tile.children.find(x => x.id === (Tile.data["_id"] + "_mask")).destroy(true,true,true);
                Tile.tile._mask = null;
                Tile.isMask = false;
                Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask")));
                Tile.setFlag("tile-mask", "normalmask", true);
                
            } else if (Tile.getFlag("tile-mask","invertmask")=== true)
            {
                Tile.children.find(x=>x.id=== Tile.data["_id"]+"_inversemask").destroy();
                 canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer").destroy();
                Hooks.off("updateTile", Hooks._hooks.updateTile.find(x=>x.id===(Tile.data['_id'] + '_mask')));
                Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask")));
                Tile.tile.visible = true; 
                Tile.setFlag("tile-mask", "invertmask", true);
            }               
            }
        
     
        if(Tile.getFlag("tile-mask", "radius")) {
            var dataRadius = updateData.flags["tile-mask"]["radius"];
            var dataBlur = updateData.flags["tile-mask"]["blur"];
            document.getElementById("myInputRadius").value = dataRadius;
            document.getElementById("myInputBlur").value = dataBlur; 
        }

      
        object.find(".activate-mask").click(() => {


            if (!Tile.getFlag("tile-mask","normalmask") 
            && !Tile.getFlag("tile-mask","invertmask")) {

            Tile.setFlag("tile-mask", "normalmask", true);
            Tile.setFlag("tile-mask", "invertmask", false)
                console.log("setting flag to true");

            } else {
            Tile.setFlag("tile-mask", "normalmask", false);
            Tile.setFlag("tile-mask", "invertmask", false)   
                console.log("setting  flag to false");
            }

        }); 

        object.find(".activate-inversemask").click(() => {
            
            if (!Tile.getFlag("tile-mask","invertmask")
            && !Tile.getFlag("tile-mask","normalmask")){

            Tile.setFlag("tile-mask", "invertmask", true);
            Tile.setFlag("tile-mask", "normalmask", false);
                console.log("setting  inverse flag to true");

            }else{
            Tile.setFlag("tile-mask", "invertmask", false);
            Tile.setFlag("tile-mask", "normalmask", false);  
                 console.log("setting  inverse flag to false");
            }
                                                                           
        }); 
    }  
    
    static create(scene, object, updateData) {
        
        
    if (canvas.tiles.objects.children.lenth ===0){
        return;
    }
    if (!updateData) {  
        canvas.tiles.objects.children.forEach(init);
                                                 
    }
    else {
        init();     
    }   
          function init(obj, index, array){   
                
                if(!obj){
                 
                    var Tile = canvas.tiles.get(updateData["_id"]); 
                    var gridSize = scene.data.grid;
                    
                }else{
                    var Tile = canvas.tiles.get(obj.data["_id"]);
                    var gridSize = obj.scene.data.grid;
                  
                }
                if (Tile.getFlag("tile-mask","invertmask") === undefined 
                    && Tile.getFlag("tile-mask","normalmask")=== undefined) { 
                    console.log("no flag set");
        
                        return;
                } 
            
                
 
                var radius, blurSize, sqHr, sqWr;
                if (!Tile.getFlag("tile-mask", "radius")) { 
                    radius = 2 * (gridSize * .5);
                }else { 
                    radius = Tile.getFlag("tile-mask", "radius") * (gridSize * .5) }
                if (!Tile.getFlag("tile-mask", "blur")) { 
                    blurSize = 2* 5;
                }else { 
                    blurSize = Tile.getFlag("tile-mask", "blur") * 5; } 

                    console.log("at creation",Tile.getFlag("tile-mask", "radius"),Tile.getFlag("tile-mask", "blur"));

                sqHr = (Tile.data.height + radius + (blurSize * 4) ) * 2 ;
                sqWr = (Tile.data.width  + radius + (blurSize * 4) ) * 2 ;
            
                var containerObject =  canvas.tilemaskeffect.children.find(x=>x.id===Tile.data["_id"]+"_maskContainer");
                 
           
                function tokenMove(scene) { 
                                         
                        var Tokens = canvas.tokens.ownedTokens;
                        for (var i = 0; i<Tokens.length;i++) {
                            var tokensOwned = Tokens[i];
                            //let gridSize = scene.data.grid;
                           // var  hehe = canvas.tilemaskeffect.children.find(x=>x.id===Tile.data["_id"]+"_maskContainer");
                            
                                         
                            if (Tile.data.flags["tile-mask"]["normalmask"]===true) {
                                
                                var maskObject = Tile.children.find(x=>x.id=== Tile.data["_id"] + "_mask");  
                            } else {                              
                                var maskObject = Tile.children.find(x=>x.id=== Tile.data["_id"] + "_inversemask");
                            } 

                            if ( tokensOwned.owner === true && tokensOwned._controlled === true) { 

                                if ( tokensOwned.data.x < Tile.data.x - ((radius + (blurSize/4)) * 1.3) ||
                                     tokensOwned.data.x > Tile.data.x + ((sqWr / 2) - ( radius + blurSize ))          || 
                                     tokensOwned.data.y < Tile.data.y - ((radius + (blurSize/4)) * 1.3) || 
                                     tokensOwned.data.y > Tile.data.y + ((sqHr / 2) -( radius + blurSize ))
                                   ){
                                //console.log("xData",xData, yData, "Tiledata",Tile.data.x,Tile.data.y);

                                        if (maskObject.position.x !== Tile.data.x ||
                                            maskObject.position.y !== Tile.data.y) {
                                                maskObject.position.x = 0;
                                                maskObject.position.y = 0;
                                           // if  (!game.user.isGM)  hehe.alpha = 1;
                                        }
                                    
                                } else {  
                                    
                                    if (maskObject.visible === true || Tile.isMask === true ){
                                        
                                        //console.log("app data", gridSize);
                                        maskObject.position.x = (-(sqWr / 2)  - Tile.x)+ tokensOwned.data.x + (gridSize * .5);      
                                        maskObject.position.y = (-(sqHr / 2)  - Tile.y)+ tokensOwned.data.y + (gridSize * .5);  
                                        //if (!game.user.isGM) hehe.alpha = 0.5;
                                    } 

                                }
                            }
                            
                        }                  
                    } 

                function setupMask() {
                    
                    const circle = new PIXI.Graphics()
                    .beginFill(0xFF0000)
                    .drawCircle(sqWr / 2, sqHr / 2, radius)
                    .endFill();

                    circle.filters  = [new PIXI.filters.BlurFilter(blurSize)];
                    const bounds    =  new PIXI.Rectangle(0, 0, sqWr * 2, sqHr * 2);
                    const texture   =  canvas.app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, bounds);

                    const focus = new PIXI.Sprite(texture);
                    focus["id"] = Tile.data["_id"] + "_mask";
                    
                    Tile.addChild(focus);
                    Tile.tile.mask = focus; //PIXI mask Effect 
                    Tile.isMask = true;  
             
                    Hooks.on('updateToken', tokenMove);
                    tokenMove.id = Tile.data['_id'] + '_mask';
                    
}

                function setupInverse() {

                    const imgCopy = new PIXI.Sprite(Tile.texture);

                        imgCopy.id       = Tile.data['_id'] + 'imgCopy';
                        imgCopy.rotation = Tile.data.rotation * Math.PI / 180; 
                        imgCopy.anchor.set(0.5, 0.5);

                        imgCopy.x        = Tile.data.width/2 ;
                        imgCopy.y        = Tile.data.height/2 ;	    
                        imgCopy.width    = Tile.data.width;
                        imgCopy.height   = Tile.data.height;
                    if (game.user.isGM) imgCopy.tint =0x99BCFB ;
                        


                    const maskContainer = new PIXI.Container(imgCopy);
                        maskContainer.name = 'maskContainer';
                        maskContainer.id   = Tile.data['_id'] + '_maskContainer';
                        maskContainer.x    = Tile.x;
                        maskContainer.y    = Tile.y;
                        maskContainer.addChild(imgCopy);


                    canvas.tilemaskeffect.addChild(maskContainer);
                                       
                    function containerMove(){

                            if (Tile.data.flags["tile-mask"]["invertmask"]=== true){
                                maskContainer.position.x = Tile.data.x;
                                maskContainer.position.y = Tile.data.y; 

                            }
                         }

                    containerMove.id = Tile.data['_id'] + '_mask'; 
                    
                    Hooks.on('updateTile', containerMove);  
                    
                    
                   // if (game.user.isGM) maskContainer.alpha =.25 ;
                                         

                        const maskGraphic = new PIXI.Graphics()   

                            .beginFill(0xFF0000)
                            .drawRect(0, 0, sqWr, sqHr)
                            .beginHole()
                            .drawCircle(sqWr / 2, sqHr / 2, radius)
                            .endHole()
                            .endFill();
                        maskGraphic.filters = [new PIXI.filters.BlurFilter(blurSize)];
                        const texture = canvas.app.renderer.generateTexture(maskGraphic);
                        const focus = new PIXI.Sprite(texture);
                        focus.id = Tile.data['_id'] + '_inversemask';

                        Tile.addChild(focus);

                        //if(containerObject.worldVisbile = true){ 
                            Hooks.on('updateToken', tokenMove);
                            tokenMove.id = Tile.data['_id'] + '_mask'; 
                            imgCopy.mask = focus;   //PIXI mask EFFECT  
                        //}

                        Tile.tile.visible = false;
                        
}
            
                function checkFlag() {
                    
          
                    if ((Tile.data.flags["tile-mask"]["normalmask"]===true  && Tile.tile._mask === null) || (Tile.data.flags["tile-mask"]["invertmask"]===true && canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer") === undefined)){
                        if (Tile.data.flags["tile-mask"]["normalmask"]===true) {
                             setupMask();
                        } else { 
                            setupInverse(); 
                        }
                    } else if ((Tile.data.flags["tile-mask"]["normalmask"]=== false && Tile.tile._mask) || (Tile.data.flags["tile-mask"]["invertmask"]=== false  && canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer"))) {
                        
                        if (Tile.tile._mask !== null){
                            
                                    Tile.children.find(x => x.id === (Tile.id + "_mask")).destroy(true,true,true);
                                    Tile.tile._mask = null;
                                    Tile.isMask = false;
                                    Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask")));
                                    return;
 
                        } else {
                                    Hooks.off("updateTile", Hooks._hooks.updateTile.find(x=>x.id===(Tile.data['_id'] + '_mask')));
                                    Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask")));
                                    Tile.children.find(x=>x.id=== Tile.data["_id"]+"_inversemask").destroy();
                                    canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer").destroy();
                                    Tile.tile.visible = true; 
                                    return;
                    
                        }
                    } else {return;}
                        
                    }
                
                
                checkFlag();
         }
    }
    
}

Hooks.once('ready', () => {
    if (game.user.isGM) {
        Hooks.on('renderTileHUD', (scene, object, updateData) => {
            Tilemask.addTokenMaskButton(scene, object, updateData),   
            Tilemask.maskButton(scene, object, updateData)    

        });   
    }
   
});


Hooks.on ("updateTile", (scene, object, updateData) => {
    Tilemask.create(scene, object, updateData);
});

Hooks.on('canvasReady', () => {
    Tilemask.create();
});




Hooks.on("preDeleteTile", (scene, object) => {

let Tile = canvas.tiles.get(object["_id"]);
    
if (Tile.getFlag("tile-mask","invertmask")=== undefined && Tile.getFlag("tile-mask","normalmask")=== undefined){
    return;
}

if (Tile.getFlag("tile-mask","invertmask")=== true && canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer") ){
    
    canvas.tilemaskeffect.children.find(x=>x.id=== Tile.data["_id"]+"_maskContainer").destroy();   
    Hooks.off("updateTile", Hooks._hooks.updateTile.find(x=>x.id===(Tile.data['_id'] + '_mask'))); //removes the caches
    
        Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask")));

} else if ( Tile.getFlag("tile-mask","normalmask")=== true && Tile.tile._mask !==null
){
    Hooks.off("updateToken", Hooks._hooks.updateToken.find(x=>x.id===(Tile.data["_id"] + "_mask"))); //removes the hook function to follow token
}

});

Hooks.once("updateScene", () => {

    function removeDuplicates(arr){      
      var unique_array = [];
      for(var i = 0;i < arr.length; i++){          
        if(unique_array.indexOf(arr[i]) == -1){              
          unique_array.push(arr[i])
        }       
        }
      return unique_array
    }

    if (Hooks._hooks.updateToken) {
    var updateTokenArr = Hooks._hooks.updateToken;
    var x = removeDuplicates(updateTokenArr);
      for (var i = 0; i<x.length;i++) {     
        Hooks.off( "updateToken", x[i]);      
      }
    }
    if(Hooks._hooks.updateTile){
    var updateTilearr = Hooks._hooks.updateTile;
    var y = removeDuplicates(updateTilearr);
      for (var i = 0; i< y.length;i++) {     
        Hooks.off( "updateTile", y[i]);      
      }  

    }
    

});
//console.trace("Tracing this function");   
console.log("Tile Mask Icon Loaded");
