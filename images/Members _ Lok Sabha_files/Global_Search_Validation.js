﻿
         var specialKeys = new Array();
         specialKeys.push(8); //Backspace
         specialKeys.push(9); //Tab
         specialKeys.push(13); //Enter
         specialKeys.push(32); //space
         specialKeys.push(46); //Delete
         specialKeys.push(36); //Home
         specialKeys.push(35); //End
         specialKeys.push(37); //Left
         specialKeys.push(39); //Right
         function IsAlphaNumeric(e) {


             var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;

             var ret = ((keyCode >= 48 && keyCode <= 57) || (keyCode == 32) || (keyCode == 13) || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || (specialKeys.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
             document.getElementById("error").style.display = ret ? "none" : "inline";
             return ret;
         }


         function IsAlphaNumericPast() {

             var spclChars = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";



             var content = document.getElementById("txtSearchGlobal").value;
             if (content.length < 3) {
                 alert("Minimum 3 characters are needed");
                 //document.getElementById("txtSearchGlobal").value = "";
                 return false;
             }
             else{
                 for (var i = 0; i < content.length; i++) {
                     if (spclChars.indexOf(content.charAt(i)) != -1) {
                         alert("Special characters are not allowed.");
                         document.getElementById("txtSearchGlobal").value = "";
                         return false;
                     }
                     
                 }

             }

         }

 