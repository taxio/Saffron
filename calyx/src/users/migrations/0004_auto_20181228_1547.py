# Generated by Django 2.1.4 on 2018-12-28 06:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_joined'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='created_date',
            new_name='created_at',
        ),
        migrations.RenameField(
            model_name='user',
            old_name='modified_date',
            new_name='modified_at',
        ),
        migrations.AddField(
            model_name='user',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='削除日時'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
