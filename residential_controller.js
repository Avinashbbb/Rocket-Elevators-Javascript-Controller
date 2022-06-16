const { isEmpty } = require("lodash");

let elevatorID = 1
let floorRequestButtonID = 1
let callButtonID = 1

class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators) {
        this.ID = _id;
        this.status = "online";
        this.elevatorList = [];
        this.callButtonList = [];
        this.createElevators(_amountOfFloors,_amountOfElevators);
        this.createCallButtons(_amountOfFloors);
    };
    // Creating methods
    createElevators(_amountOfFloors,_amountOfElevators){
        // console.log(_amountOfFloors)
        // console.log(_amountOfElevators)
        for(let i = 1; i <= _amountOfElevators; i++){
            let elevator = new Elevator(elevatorID, "idle", _amountOfFloors, 1)//id, status, amountOfFloors, currentFloor
            this.elevatorList.push(elevator);
            elevatorID++
            
        }
        
    };
    createCallButtons(_amountOfFloors){
        let buttonFloor = 1;
        for ( let i=1;i <= _amountOfFloors ;i++){
            if(buttonFloor < _amountOfFloors){//If it's not the last floor
                let callButton = new CallButton(callButtonID, "OFF", buttonFloor, "Up");//added the element status to the actual class for off
                this.callButtonList.push(callButton)
                callButton.callButtonID ++;
            }if(buttonFloor > 1){//If it's not the first floor
                let callButton = new CallButton(callButtonID, "OFF", buttonFloor, "down");//added the element status to the actual class for Off
                this.callButtonList.push(callButton);
                callButton.callButtonID ++;
            }
            buttonFloor ++ ;
        };    
    };
    //Simulate when a user press a button outside the elevator
    requestElevator(floor,direction){//direction RETURNING elevator
        let elevator = this.findElevator(floor,direction);
        elevator.floorRequestList.push(floor);
        elevator.move();//needs varificition line 46
        elevator.operateDoors();//needs varificition line 47
        return elevator
    }

    findElevator(requestedFloor,requestedDirection ){
        let bestElevator;//needs clarification line 55
        let bestScore = 5;
        let referenceGap = 10000000;
        let bestElevatorInformations;
        
        
        for(let element = 0; element < this.elevatorList.length; element ++ ){
        // this.elevatorList.forEach(element => {
            
            //The elevator is at my floor and going in the direction I want
            if(requestedFloor == this.elevatorList[element].currentFloor && this.elevatorList[element].status == "stopped" && requestedDirection == this.elevatorList[element].direction){
                bestElevatorInformations = this.checkIfElevatorIsBetter(1,this.elevatorList[element],bestScore,referenceGap,bestElevator,requestedFloor);
            //The elevator is lower than me, is coming up and I want to go up
            } else if (requestedFloor > this.elevatorList[element].currentFloor && this.elevatorList[element].direction == "up" && requestedDirection == this.elevatorList[element].direction){
                
                bestElevatorInformations = this.checkIfElevatorIsBetter(2,this.elevatorList[element],bestScore,referenceGap,bestElevator,requestedFloor)
            //The elevator is higher than me, is coming down and I want to go down
            } else if(requestedFloor < this.elevatorList[element].currentFloor && this.elevatorList[element].direction == "down" && requestedDirection == this.elevatorList[element].direction){
                bestElevatorInformations = this.checkIfElevatorIsBetter(2,this.elevatorList[element],bestScore,referenceGap,bestElevator,requestedFloor)
            //The elevator is idle
            }else if(this.elevatorList[element].status == "idle"){
                
                bestElevatorInformations = this.checkIfElevatorIsBetter(3,this.elevatorList[element],bestScore,referenceGap,bestElevator,requestedFloor)
            //The elevator is not available, but still could take the call if nothing better is found
            }else{
                
                bestElevatorInformations = this.checkIfElevatorIsBetter(4,element,bestScore,referenceGap,bestElevator,requestedFloor)
            }
            bestElevator = bestElevatorInformations.bestElevator;
            bestScore = bestElevatorInformations.bestScore;
            referenceGap = bestElevatorInformations.referenceGap;
            
        }
        // console.log(referenceGap)
            return bestElevator;
    }
    checkIfElevatorIsBetter(scoreToCheck,newElevator,bestScore,referenceGap,bestElevator,floor){
        
        if(scoreToCheck < bestScore){
            bestScore = scoreToCheck;
            bestElevator = newElevator;
            referenceGap = Math.abs(newElevator.currentFloor - floor);
        }else if(bestScore == scoreToCheck){
            let gap = Math.abs(newElevator.currentFloor - floor);
            if(referenceGap > gap){
                bestElevator = newElevator;
                referenceGap = gap;
            }
        }
        let bestElevatorInformations = {
            bestElevator,
            bestScore,
            referenceGap
        }
        return bestElevatorInformations;

    }
}

class Elevator {
    constructor(_id,_amountOfFloors) {
        this.ID = _id;
        this.status = "idle";
        this.currentFloor = 1;
        this.direction = null;
        this.overweight = false;
        this.obstruction = false;
        this.door = new Door(_id);
        this.floorRequestButtonList =[];
        this.floorRequestList = [];
        this.createFloorRequestButtons(_amountOfFloors);
    }
    createFloorRequestButtons(_amountOfFloors){
        console.log(1)
        let buttonFloor = 1;
        for(let i=1; i <= _amountOfFloors; i++){
            let floorRequestButton = new FloorRequestButton(floorRequestButtonID,"OFF",buttonFloor)//id,status,floor
            this.floorRequestButtonList.push(floorRequestButton);
            buttonFloor ++;
            floorRequestButtonID ++;
        }
    }
 //Simulate when a user press a button inside the elevator
    requestFloor(floor){
        this.floorRequestList.push(floor);//
        this.move();
        this.operateDoors();
    }

    move(){
        while(this.floorRequestList.length != 0){
            let destination = this.floorRequestList[0];
            this.status = "moving";
            if(this.currentFloor < destination){
                this.direction = "up";
                this.sortFloorList();
                while(this.currentFloor < destination){
                    this.currentFloor ++;
                    this.screnDisplay = this.currentFloor;
                }
            }else if(this.currentFloor > destination){
                this.direction = "down";
                this.sortFloorList();
                while(this.currentFloor > destination){
                    this.currentFloor -- ;
                    this.screenDisplay = this.currentFloor;
                }
            }
            this.status = "stopped";
            this.floorRequestList.shift();
        }
        this.status = "idle";
    }
    sortFloorList(){
        if(this.direction == "up"){
            this.floorRequestList.sort((a,b) => a-b);
        }else{
            this.floorRequestList.sort((b,a) => b-a);
        }
    }
    operateDoors(){
        this.door.status = "opened";
        //wait 5 seconds
        setTimeout(()=>{
            

            if(!this.overweight){
                this.door.status = "closing";
                if(!this.obstruction){
                    this.door.status = "closed"
                }else{
                    this.operateDoors()
                }
            }else{
                while(this.overweight){
                    console.log("overweight alarm")
                }
                this.operateDoors()
            }
        },5000)
    }

}

class CallButton {
    constructor(_id,_floor, _direction) {//added the element status to the actual class
        this.ID = _id;
        this.status = "idle";
        this.floor = _floor;
        this.direction = _direction
    }
}

class FloorRequestButton {
    constructor(_id,_floor) {
        this.ID = _id;
        this.status = "idle";
        this.floor = _floor;
    }
}

class Door {
    constructor(_id) {
        this.ID = _id;
        this.status = "idle";
    }
}

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door }

// //Scenario 1
// let column = new Column(1,"online",10,2);
// column.elevatorList[0].currentFloor = 2;
// column.elevatorList[1].currentFloor = 6;

// let elevator = column.requestElevator(3,"up");
// elevator.requestFloor(7);

// //Scenario 2
// let column2 = new Column(1,"online",10,2);
// column2.elevatorList[0].currentFloor = 10;
// column2.elevatorList[1].currentFloor = 3;
// //part 1
// let elevator2 = column2.requestElevator(1,"up");
// elevator2.requestFloor(6);
// //part 2 
// let elevator3 = column2.requestElevator(3,"up");
// elevator3.requestFloor(5);
// //part 3
// let elevator4 = column2.requestElevator(9,"down");
// elevator4.requestFloor(2);

// //Scenario 3
// let column3 = new Column(1,"online",10,2)
// column3.elevatorList[0].currentFloor = 10;
// column3.elevatorList[1].currentFloor = 3;
// column3.elevatorList[0].status = "moving";
// column3.elevatorList[1].floorRequestList.push(6);
// //part 1
// let elevator3a = column3.requestElevator(3,"down");
// elevator3a.requestFloor(2);
// //part 2
// let elevator3b = column3.requestElevator(10,"down");
// elevator3b.requestFloor(3);
