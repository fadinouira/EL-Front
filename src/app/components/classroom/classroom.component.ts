import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/services/user.service';
import Konva from 'konva';
import { ShapeService } from 'src/app/services/shape.service';
import { TextNodeService } from 'src/app/services/text-node.service';

@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent implements OnInit {

  users: User[] = [];

  shapes: any = [];
  stage!: Konva.Stage;
  layer!: Konva.Layer;
  selectedButton: any = {
    'circle': false,
    'rectangle': false,
    'line': false,
    'undo': false,
    'erase': false,
    'text': false
  }
  erase: boolean = false;
  transformers: Konva.Transformer[] = [];

  constructor(
    private userService: UserService,
    private shapeService: ShapeService,
    private textNodeService: TextNodeService
  ) { }

  ngOnInit(): void {
    this.getUsers();

    let width = window.innerWidth * 0.9;
    let height = 300;
    this.stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.addLineListeners();

  }

  private getUsers(){
    this.userService.getAllUsers().subscribe(data => {
      console.log(data.every);
      this.users = data;
    });
  }

  clearSelection() {
    Object.keys(this.selectedButton).forEach(key => {
      this.selectedButton[key] = false;
    })
  }

  setSelection(type: string) {
    this.selectedButton[type] = true;
  }

  addShape(type: string) {
    this.clearSelection();
    this.setSelection(type);
    if (type == 'circle') {
      this.addCircle();
    }
    else if (type == 'line') {
      this.addLine();
    }
    else if (type == 'rectangle') {
      this.addRectangle();
    }
    else if (type == 'text') {
      this.addText();
    }
  }

  addText() {
    const text = this.textNodeService.textNode(this.stage, this.layer);
    this.shapes.push(text.textNode);
    this.transformers.push(text.tr);
  }

  addCircle() {
    const circle = this.shapeService.circle();
    this.shapes.push(circle);
    this.layer.add(circle);
    this.stage.add(this.layer);
    this.addTransformerListeners()
  }

  addRectangle() {
    const rectangle = this.shapeService.rectangle();
    this.shapes.push(rectangle);
    this.layer.add(rectangle);
    this.stage.add(this.layer);
    this.addTransformerListeners()
  }

  addLine() {
    this.selectedButton['line'] = true;
  }

  addLineListeners() {
    const component = this;
    let lastLine: any;
    let isPaint: any;
    this.stage.on('mousedown touchstart', function (e) {
      if (!component.selectedButton['line'] && !component.erase) {
        return;
      }
      isPaint = true;
      let pos = component.stage.getPointerPosition();
      const mode = component.erase ? 'erase' : 'brush';
      lastLine = component.shapeService.line(pos, mode)
      component.shapes.push(lastLine);
      component.layer.add(lastLine);
    });
    this.stage.on('mouseup touchend', function () {
      isPaint = false;
    });
    // and core function - drawing
    this.stage.on('mousemove touchmove', function () {
      if (!isPaint) {
        return;
      }
      const position: any = component.stage.getPointerPosition();
      var newPoints = lastLine.points().concat([position.x, position.y]);
      lastLine.points(newPoints);
      component.layer.batchDraw();
    });
  }

  undo() {
    const removedShape = this.shapes.pop();
    this.transformers.forEach(t => {
      t.detach();
    });
    if (removedShape) {
      removedShape.remove();
    }
    this.layer.draw();
  }

  addTransformerListeners() {
    const component = this;
    const tr = new Konva.Transformer();
    this.stage.on('click', (e) => {
      if (e.target === this.stage) {
         console.log('click on empty area');
         // deselect code
      } else {
        console.log('click on shape', e.target);
        // select code
      }
    });
  }

  addDeleteListener(shape: any) {
    const component = this;
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Delete') {
        shape.remove();
        component.transformers.forEach(t => {
          t.detach();
        });
        const selectedShape = component.shapes.find((s: any) => s._id == shape._id);
        selectedShape.remove();
        e.preventDefault();
      }
      component.layer.batchDraw();
    });
  }

  clearBoard() {
    location.reload();
  }

}
