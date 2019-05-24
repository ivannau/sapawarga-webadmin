<?php

namespace app\modules\v1\controllers;

use app\filters\auth\HttpBearerAuth;
use app\models\Attachment\AspirasiPhotoForm;
use app\models\Attachment\PhoneBookPhotoForm;
use app\models\AttachmentForm;
use Yii;
use yii\filters\AccessControl;
use yii\filters\auth\CompositeAuth;
use yii\web\UploadedFile;

class AttachmentController extends ActiveController
{
    public $modelClass = AttachmentForm::class;

    public function actions()
    {
        return [
            'options' => [
                'class' => 'yii\rest\OptionsAction',
            ],
        ];
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class'       => CompositeAuth::className(),
            'authMethods' => [
                HttpBearerAuth::className(),
            ],
        ];

        $behaviors['verbs'] = [
            'class'   => \yii\filters\VerbFilter::className(),
            'actions' => [
                'create' => ['post'],
            ],
        ];

        // remove authentication filter
        $auth = $behaviors['authenticator'];
        unset($behaviors['authenticator']);

        // add CORS filter
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::className(),
            'cors'  => [
                'Origin'                         => ['*'],
                'Access-Control-Request-Method'  => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
            ],
        ];

        // re-add authentication filter
        $behaviors['authenticator'] = $auth;
        // avoid authentication on CORS-pre-flight requests (HTTP OPTIONS method)
        $behaviors['authenticator']['except'] = ['options', 'public'];

        // setup access
        $behaviors['access'] = [
            'class' => AccessControl::className(),
            'only'  => ['create'], //only be applied to
            'rules' => [
                [
                    'allow'   => true,
                    'actions' => ['create'],
                    'roles'   => ['admin', 'manageSettings', 'user', 'staffRW'],
                ],
            ],
        ];

        return $behaviors;
    }

    public function actionCreate()
    {
        $type = Yii::$app->request->get('type');

        $model = null;

        switch ($type) {
            case 'phonebook_photo':
                $model = new PhoneBookPhotoForm();
                break;
            case 'aspirasi_photo':
                $model = new AspirasiPhotoForm();
                break;
        }

        if ($model === null) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(400);

            return ['Model type not set.'];
        }

        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        $model->file = UploadedFile::getInstanceByName('file');
        $model->type = $type;

        if (!$model->validate()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(422);

            return $model->getErrors();
        }

        if ($model->upload()) {
            $relativePath = $model->getRelativeFilePath();
            $url = $model->getFileUrl();

            $responseData = [
                'path' => $relativePath,
                'url'  => $url,
            ];

            return $responseData;
        }

        $response = Yii::$app->getResponse();
        $response->setStatusCode(400);
    }
}
