package com.uyirgene.course;

import com.uyirgene.course.dto.CourseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDto {
    private CourseDto course;
    private Enrollment.Status status;
}
