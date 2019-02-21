from django import forms

from .models import Course


class CourseForm(forms.ModelForm):
    """
    Courseモデルに設定したPINコードが表示されないようにするフォーム
    """
    pin_code1 = forms.CharField(
        label='PINコード（変更）',
        widget=forms.PasswordInput,
        help_text='この課程・学部に学生が登録する際に必要となるコードです．英数字のみ使用可能です．'
    )
    pin_code2 = forms.CharField(
        label='PINコード（再入力）',
        widget=forms.PasswordInput,
        help_text='確認のため再度入力してください'
    )

    class Meta:
        fields = ['name', 'year']
        model = Course

    def clean_pin_code2(self):
        """
        入力されたPINコードが二つとも正しいことを検証する
        :return: pin_code2の文字列
        """
        pin1 = self.cleaned_data.get('pin_code1')
        pin2 = self.cleaned_data.get('pin_code2')
        if pin1 and pin2 and pin1 != pin2:
            raise forms.ValidationError('入力されたPINコードが一致しません')
        return pin2

    def save(self, commit=True):
        """
        Formでのバリデーション時にPINコードをセットする
        :param commit: データベースへフラッシュするかどうか
        :return: Courseオブジェクト
        """
        course = super(CourseForm, self).save(commit=False)
        course.set_password(self.cleaned_data['pin_code2'])
        if commit:
            course.save()
        return course
