# Generated by Django 2.1.2 on 2018-10-11 04:55

from django.db import migrations, models
import users.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(help_text='小文字の英数字および数字のみ使用できます', max_length=64, unique=True, validators=[users.models.StudentNumberValidator()], verbose_name='学生ID'),
        ),
    ]
