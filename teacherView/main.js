var studySessionCode
var teacherId
var ref 

function newStudySession() {
	var sessionName = document.getElementById("sessionName").value
	
	if(sessionName.length > 0) {
		var d = new Date();
		var seconds = d.getTime() / 10000 

	

		var longCode = seconds.toString(16)
		var shortCode = longCode.substr(longCode.length - 6) //get last 6 digits of timestamp hex

		if(teacherId != null && teacherId.length > 0) {
			var newSession = { "teacherId" : teacherId,
							"name" : sessionName,
							"students" : []}
			firebase.database().ref('studySessions/' + shortCode).set(newSession);

			studySessionCode = shortCode
			document.getElementById("code").innerHTML = shortCode
			document.getElementById("studySession").style.display = "block"
			document.getElementById("signUp").style.display = "none"

			localStorage.setItem("storedSessionCode", studySessionCode)
			setupPage()
		} else {
			alert("Something went wrong. (Authentication Error)")
		}
	} else {
		alert("Enter a class name so your students will know they've join the correct class.")
	}		
}

function clearCurrentSession() {
	if(window.confirm("This will remove the current study session. You will not be able to get it back.")) {
	    localStorage.setItem("storedSessionCode", "")
	    studySessionCode = null
	    document.getElementById("sessionName").value = ""
	    ref.off()
		setupPage()
	} 
}

function fetchStudents() {
	ref = firebase.database().ref('studySessions/' + studySessionCode); 
    ref.on("value", function(snapshot){

		//remove current li's to prevent duplicates 
		var ful = document.getElementById("focusedStudentList");
		while (ful.firstChild) {
		    ful.removeChild(ful.firstChild);
		}

		//remove current li's to prevent duplicates 
		var dul = document.getElementById("distractedStudentList");
		while (dul.firstChild) {
		    dul.removeChild(dul.firstChild);
		}

		var hasChildren = false
		snapshot.child("students").forEach((studentSnapshot) => {

			studentName = studentSnapshot.child("username").val()
			imageName = studentName.charAt(0) != "T" ? "avatar1.png" : "avatar2.png"

			  var li = document.createElement("li");
			  if(studentSnapshot.child("active").val()){
			  	li.appendChild(document.createTextNode(studentSnapshot.child("username").val()));

				  	let dot = document.createElement("div")
				  	dot.classList.add("dot")
				  	li.appendChild(dot)

				  	let profilePic = document.createElement("img")
				  	profilePic.src = "images/avatars/" + imageName
				  	profilePic.classList.add("profilePic")
				  	li.appendChild(profilePic)

			  	ful.appendChild(li);	
			  	li.classList.add("studentBox")
			  } else {
			  	li.appendChild(document.createTextNode(studentSnapshot.child("username").val()));

				  	let dot = document.createElement("div")
				  	dot.classList.add("dot", "distractedDot")
				  	li.appendChild(dot)

			  		let profilePic = document.createElement("img")
			  		profilePic.src = "images/avatars/" + imageName
				  	profilePic.classList.add("profilePic")
				  	li.appendChild(profilePic)

			  	li.classList.add("studentBox", "distractedBox")
			  	dul.appendChild(li);
			  }

			  var fulCount = document.getElementById("focusedStudentList").getElementsByTagName("li").length
			  var dulCount = document.getElementById("distractedStudentList").getElementsByTagName("li").length
			  document.getElementById("focusedStudentCount").innerHTML = fulCount != null ? fulCount : "0"
			  document.getElementById("distractedStudentCount").innerHTML = (dulCount != null) ? dulCount : "0"

			  hasChildren = true
		 });

		document.getElementById("studentCardEmptyLabel1").style.display = hasChildren ? "none" : "block" 
		document.getElementById("studentCardEmptyLabel2").style.display = hasChildren ? "none" : "block" 
		document.getElementById("studentCardThingsWithStudents").style.display = hasChildren ? "block" : "none"
		document.getElementById("className").innerHTML = snapshot.child("name").val()

	}, function(error) {
		console.error(error);
	});
}

function setupPage() {
	var hasCode = false
	var locallySavedCode = localStorage.getItem("storedSessionCode")
	if(locallySavedCode != null && locallySavedCode.length > 0){
		studySessionCode = locallySavedCode
		hasCode = true
		fetchStudents()
	}

	document.getElementById("code").innerHTML = studySessionCode ? studySessionCode : ""
	document.getElementById("studySession").style.display = hasCode ? "block" : "none"
	document.getElementById("clearButton").style.display = hasCode ? "block" : "none"
	document.getElementById("signUp").style.display = hasCode ? "none" : "block"
	document.getElementById("mainContent").style.display =  "block"
	document.getElementById("QRCodeImage").src = "	https://api.qrserver.com/v1/create-qr-code/?data=quizlet:lock/" + studySessionCode + "&size=500x500&bgcolor=fafafa"
}


document.addEventListener('DOMContentLoaded', function() {

    // Initialize Firebase
    var config = {
	    apiKey: "AIzaSyCPbYzv1z2Fbf27lFCJ3tptHusSAp3448k",
	    authDomain: "quizlock-bbdae.firebaseapp.com",
	    databaseURL: "https://quizlock-bbdae.firebaseio.com",
	    projectId: "quizlock-bbdae",
	    storageBucket: "quizlock-bbdae.appspot.com",
	    messagingSenderId: "211934781778"
    };
    firebase.initializeApp(config);

	firebase.auth().signInAnonymously().catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorMessage)
	})

    firebase.auth().onAuthStateChanged(function(user) {
	    if (user) {
	    	// User is signed in.
	        var isAnonymous = user.isAnonymous;
	    	var uid = user.uid;

	    	teacherId = user.uid
			setupPage()
		} else {
		    console.log("sign in didn't work - no user")
		}
	});

});