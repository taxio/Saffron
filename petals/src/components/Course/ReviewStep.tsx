import * as React from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { CourseCreateFormParams } from './CourseCreateManager';

const submitCourseData = (values: CourseCreateFormParams) => {
  console.log(values);
};

interface CreateReviewProps extends InjectedFormProps {}

const ReviewStep: React.FC<CreateReviewProps> = props => {
  const { handleSubmit } = props;

  return (
    <React.Fragment>
      入力情報確認ページ
      <form onSubmit={handleSubmit(submitCourseData)}>
        <button type="submit">dbg</button>
      </form>
    </React.Fragment>
  );
};

export default reduxForm({
  form: 'CourseCreateForm',
})(ReviewStep);
