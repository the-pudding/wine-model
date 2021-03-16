aws-sync:
	aws s3 sync docs s3://pudding.cool/2021/03/wine-model --delete --cache-control 'max-age=31536000'
aws-cache:
	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/2021/03/wine-model*'	
pudding: aws-sync aws-cache