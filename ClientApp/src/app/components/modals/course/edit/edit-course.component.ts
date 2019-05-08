


import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';



import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Course } from '../../../../models/course';
import { CourseService } from 'src/app/services/course.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Prerequisite } from 'src/app/models/prerequisite';
import { CourseDialogData } from 'src/app/components/course/course.component';





@Component({
    selector: 'edit-course',
    styleUrls: ['./edit-course.component.css'],
    templateUrl: './edit-course.component.html'
})



export class EditCourseComponent implements OnInit {

    public editCourseForm: FormGroup;
    courseAutoComplete = new FormControl();
    filteredCourses: Observable<Course[]>;
    public courses: Course[] = [];
    public prereqList: string[] = [];
    public validCourseId: boolean = true;
    public validPreq: boolean = true;
    public selectedPreq: string;
    public editCourse: Course = new Course();

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<EditCourseComponent>,
        public courseService: CourseService,
        @Inject(MAT_DIALOG_DATA) public data: CourseDialogData) {
    }

    ngOnInit() {
        this.createForm();

    }

    private createForm() {
        this.editCourseForm = this.fb.group({
            courseId: new FormControl(this.data.course.courseId, [Validators.required]),
            passingGrade: new FormControl(this.data.course.passingGrade, [Validators.required]),

        });
        this.courseAutoComplete.reset();
        this.prereqList = this.data.course.prerequisites.map(c => c.prerequisiteCourseId);
        this.getCourses();
    }

    public isTakenCourseId(courseId: string) {
        if (courseId === this.data.course.courseId) {
            return false;
        }
        courseId = courseId.trim();
        let courseIdList = this.courses.map(c => c.courseId);
        this.validCourseId = courseIdList.indexOf(courseId) === -1;
    }


    public selectPreq(courseId: string) {
        this.selectedPreq = courseId;

    }

    public addPrerequisite() {
        if (this.selectedPreq) {
            if (this.prereqList.indexOf(this.selectedPreq) === -1) {
                this.prereqList.push(this.selectedPreq);
                this.validPreq = true;
            }
            else {
                this.validPreq = false;
            }
        }
        this.courseAutoComplete.reset();
    }

    public removePreq(courseId: string) {
        let index = this.prereqList.indexOf(courseId);
        this.prereqList.splice(index, 1);
    }

    public submit() {
        let courseId = this.editCourseForm.value.courseId;
        let passingGrade = parseInt(this.editCourseForm.value.passingGrade);
        this.editCourse.courseId = courseId;
        this.editCourse.passingGrade = passingGrade;
        this.editCourse.prerequisites = this.prereqList.map(e => {
            let preq = new Prerequisite();
            preq.courseId = courseId;
            preq.prerequisiteCourseId = e;
            return preq;
        })

        this.data.course = this.editCourse;
    }

    async  getCourses() {
        await this.courseService.getCourses().subscribe((data: Course[]) => {
            this.courses = data;
            this.filteredCourses = this.courseAutoComplete.valueChanges
                .pipe(
                    startWith(''),
                    map(course => course ? this._filterCourses(course) : this.courses.slice())
                );
        });

    }


    private _filterCourses(value: string): Course[] {
        const filterValue = value.toLowerCase();
        return this.courses.filter(course => course.courseId.toLowerCase().indexOf(filterValue) === 0);
    }


}


